import {Component, ElementRef, HostListener, Input, OnChanges, OnInit, ViewChild} from '@angular/core';

import {Logger} from 'app/shared/services/logger.service';

import {Helper} from 'app/glyph/glyph.helper';

import {TooltipComponent} from 'app/tooltip/tooltip.component';
import {SelectionRect} from './selection-rect';

import {LenseCursor} from 'app/lense/cursor.service';
import {EventAggregatorService} from 'app/shared/events/event-aggregator.service';

import * as d3 from 'd3';
import {GlyphplotComparisonLayoutController} from './glyphplot.comparison.layout_controller'
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { GlyphplotComponent } from './glyphplot.component';
import { ComparisonMoveGlyph } from 'app/glyph/glyph.comparison.move';
import { MovementVisualizer } from 'app/glyph/glyph.comparison.move.visualizer';
import { ComparisonDataCreator } from './glyphplot.comparison.data_creator';
import { GlyphplotLayoutController } from './glyphplot.layout.controller';
import { GlyphplotComparisonEventController } from './glyphplot.comparison.event_controller';
import { ComparisonDataContainer } from './glyphplot.comparison.data_container';


@Component({
    selector: 'app-glyphplot-comparison',
    templateUrl: './glyphplot.component.html',
    styleUrls: ['./glyphplot.component.css'],
    // template: '<div>Hallo Compare</div>',
    providers: [ComparisonDataCreator, MovementVisualizer]
  })
  export class GlyphplotComparisonComponent extends GlyphplotComponent
        implements OnInit, OnChanges {
    @ViewChild('chart') public chartContainer: ElementRef;
    @ViewChild('selectionrectangle') public selectionRectangle: ElementRef;
    @ViewChild('tooltip') public tooltip: TooltipComponent;
    @Input() width: number;
    @Input() height: number;

    /**
     * Data consists of target variable for label und prediction and of position.
     */
    private _dataA: any;
    private _dataB: any;
    private _comparedData: ComparisonDataContainer;
    private _configurationDataCompare: ConfigurationDataCompare;
    private _configurationCompare: ConfigurationCompare;

    private _comparisonLayoutController: GlyphplotComparisonLayoutController;
    private _comparisonEventController: GlyphplotComparisonEventController;

    @HostListener('click', ['$event'])
    click(e: MouseEvent) {
      this._eventController.onClick(e);
    }
    @HostListener('mousemove', ['$event'])
    mouseMove(e: MouseEvent) {
      this._eventController.onMouseMove(e);
    }
    constructor(
      private _comparisonCreator: ComparisonDataCreator,
      private movementVisualizer: MovementVisualizer,
       logger: Logger,
       helper: Helper,
       configurationCompareService: ConfigurationCompare,
       cursor: LenseCursor,
       eventAggregator: EventAggregatorService
    ) {
     super(logger, helper, configurationCompareService, cursor, eventAggregator);

     this._configurationCompare = configurationCompareService;
     this._configurationDataCompare = this._configurationCompare.configurationCompareData;
     this._configurationDataCompare.getDataA().subscribe(msg => this.onMessage(msg, true));
     this._configurationDataCompare.getDataB().subscribe(msg => this.onMessage(msg, false));
     this._eventController =
     this._comparisonEventController =
       new GlyphplotComparisonEventController(
         this,
         this._configurationDataCompare,
         this.cursor,
         this.logger,
         this._configurationCompare,
         this.eventAggregator
       );
       this._comparisonLayoutController =
       this._layoutController = new GlyphplotComparisonLayoutController(
         this,
         this.logger,
         this.configurationService
       );

       movementVisualizer.heatMapComputation
        = this.configurationDataCompare.heatMapComputation;
     }

    protected initControllers() {
      // do nothing, look in constructor for controllers;
    }

    onMessage(msg, isA: boolean) {
      if (msg == null) {return; }
      (isA) ? this._dataA = msg
        : this._dataB = msg;

      if ( this._dataA != null && this._dataB != null) {
        this._comparedData = this._comparisonCreator.versions2Data(this._dataA, this._dataB);
        this.createChart();
      }
    }

    ngOnInit() {
       super.ngOnInit();
    }
    ngOnChanges() {
      if (this.context == null) {
        return;
      }
      if (this.width === 0 || this.height === 0) {
        return;
      }
      // this.selectionRect.offset = {
      //   x: this.configuration.leftSide ? 0 : window.innerWidth - this.width,
      //   y: 0
      // };
      this.updateZoom();
      this.updateGlyphLayout();
      this.animate();
    }

    createChart(): void {
    const that = this;
    const element = this.chartContainer.nativeElement;
    this.context = element.getContext('2d');
    this.tooltip.data = this._comparedData;

    this.movementVisualizer.init(this._comparedData);
    this.selectionContext = this.selectionRectangle.nativeElement.getContext('2d');
    this.selectionRect = new SelectionRect(this, this.selectionContext, this.helper);
    this.selectionRect.offset = {
      x: this.configuration.leftSide ? 0 : window.innerWidth - this.width,
      y: 0
    };
    this._simulation = d3
      .forceSimulation()
      .force('collision', d3.forceCollide().radius(20))
      .on('end', () => {
        GlyphplotComponent.ticked(that);
      })
      .stop();

    this.layoutController.updatePositions();

    this.updateZoom();
    this.animate();

    }

    draw(): void {
        this.drawLock = true;

        const context: CanvasRenderingContext2D = this.context;
        context.save();
        context.clearRect(0, 0, this.width, this.height);

        const glyph = this._configurationCompare.configurationCompareData.comparisonGlyph;
        glyph.context = context;

        if ( glyph instanceof ComparisonMoveGlyph) {
          this.movementVisualizer.updatePoints(this._comparedData);
          this.movementVisualizer.initContext(context);
          this.movementVisualizer.initFilter(this._configurationDataCompare.connectionFilter)
          const isDrawFar = (this._configurationDataCompare.filteredItemsIds != null
              && this._configurationDataCompare.filteredItemsIds.length !== 0)

          context.globalAlpha = isDrawFar ? this._configurationDataCompare.TRANSPARENCY : 1;
          this.movementVisualizer.drawConnections(
            this.configurationCompare.versionAnimation);
          context.globalAlpha = 1;

          if (isDrawFar) {
          this.movementVisualizer.drawFarConnections(
            this._configurationDataCompare.filteredItemsIds,
            this.configurationCompare.versionAnimation);
          }
        } ;
        glyph.animation = this.configurationCompare.versionAnimation
        glyph.context = this.context;
        this._comparedData.items.forEach(
          item => {
            glyph.comparisonDataItem = item;
            glyph.draw();
        });

        // this.drawScale(this.context, 0, 0);

        this.comparedData.drawA =
          this.configurationCompare.versionAnimation > 0.5;

        // context.restore();
        this.selectionRect.clear();
        this.drawLock = false;

    }

    public drawScale(context: CanvasRenderingContext2D, x: number, y: number) {
      // const heatMapComp = this.movementVisualizer.heatMapComputation;
      // const maxDiff = Math.max(
      //   Math.abs(this.movementVisualizer.meta.maxDiff),
      //   Math.abs(this.movementVisualizer.meta.minDiff),
      // );
      // const minDiff = - maxDiff;
      // const maxMove = this.movementVisualizer.meta.maxMove;
      // const d = maxMove / 256;
      // for (let diff = minDiff, _x = x; diff < maxDiff; diff += d, _x++) {
      //   for (let move = 0, _y = y; move < maxMove; move += d, _y++) {
      //     const col = heatMapComp.computeColorII(diff, move, false);
      //     context.beginPath();
      //     context.fillStyle = col;
      //     context.rect(_x, _y, 1, 1);
      //     context.fill();

      //   }
      // }
    }

    public animate() {
      this.updateGlyphLayout();

      const that = this;

      if ( this.configurationCompare.isChangeVersion) {
        // const begin =  that.configurationCompare.isDrawPositionA;
        let animation = that.configurationCompare.versionAnimation;
        const [step, end] = (animation > 0.5) ? [-0.08, 0] : [0.08, 1];
        const t = d3.timer(() => {
          animation = that.configurationCompare.versionAnimation;
          animation += step;
          if (Math.abs(end - animation) <= Math.abs(step)) {
            t.stop();
            animation = end;
          }
          that.configurationCompare.versionAnimation = animation;
          that.draw();
          }, 500);
          this.configurationCompare.isChangeVersion = false;
      } else {
        that.draw();
      }
    }

    public updateGlyphLayout(updateAllItems: boolean = false): void {
      if (this._comparedData == null) {return; }
      const that = this;
      if (! this._configurationDataCompare.useDragSelection) {
        this._comparedData.items.forEach(d => {
          if (d.positionA != null) {
          d.drawnPositionA = [
            that.transform.applyX(that.xAxis(d.positionA[0])),
            that.transform.applyY(that.yAxis(d.positionA[1]))];
          }
          if (d.positionB != null) {
          d.drawnPositionB = [
            that.transform.applyX(that.xAxis(d.positionB[0])),
            that.transform.applyY(that.yAxis(d.positionB[1]))];
          }
        });
    }
    }

    public matrixLayout(sortFunction?: any): void {
    }
    get dataA(): any {
        return this._dataA;
      }
    set dataA(value: any) {
    this._dataA = value;
    }
    get dataB(): any {
        return this._dataB;
      }
    set dataB(value: any) {
    this._dataB = value;
    }

    get comparedData() {
      return this._comparedData
    }

    public get layoutController(): GlyphplotLayoutController {
      return this._comparisonLayoutController;
    }

    get comparisonCreator() {
      return this._comparisonCreator;
    }

    get configurationCompare() {
      return this._configurationCompare;
    }
    get configurationDataCompare() {
      return this._configurationDataCompare;
    }
  }
