import {Component, ElementRef, HostListener, Input, OnChanges, OnInit, ViewChild} from '@angular/core';

import {Logger} from 'app/shared/services/logger.service';

import {Glyph} from 'app/glyph/glyph';
import {DotGlyph} from 'app/glyph/glyph.dot';
import {FlowerGlyph} from 'app/glyph/glyph.flower';
import {GlyphplotEventController} from './glyphplot.event.controller';
import {FlexiWallController} from './glyphplot.flexiwall.controller';
import {Helper} from 'app/glyph/glyph.helper';

import {TooltipComponent} from 'app/tooltip/tooltip.component';
import {SelectionRect} from './selection-rect';
import {ConfigurationData} from '../shared/services/configuration.data';

import {LenseCursor} from 'app/lense/cursor.service';
import {EventAggregatorService} from 'app/shared/events/event-aggregator.service';
import { FlowerGlyphConfiguration } from 'app/glyph/glyph.flower.configuration';
import { GlyphType } from 'app/glyph/glyph.type';

import * as d3 from 'd3';
// import { GlyphplotLayoutController } from './glyphplot.layout.controller';
import {GlyphplotComparisonLayoutController} from './glyphplot.comparison.layout_controller'
import { GlyphLayout } from 'app/glyph/glyph.layout';
import { DotGlyphConfiguration } from 'app/glyph/glyph.dot.configuration';
import { ComparisonGlyph } from 'app/glyph/glyph.comparison';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { GlyphplotComponent } from './glyphplot.component';
import { Configuration } from 'app/shared/services/configuration.service';
import { ComparisonHoleGlyph } from 'app/glyph/glyph.comparison.hole';
import { ComparisonMoveGlyph } from 'app/glyph/glyph.comparison.move';
import { MovementVisualizer } from 'app/glyph/glyph.comparison.move.visualizer';
import { ComparisonDataItem } from './glyphplot.comparison.data_item';
import { ComparisonDataCreator } from './glyphplot.comparison.data_creator';
import { GlyphplotLayoutController } from './glyphplot.layout.controller';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';


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
    // @ViewChild('tooltip') public tooltip: TooltipComponent;
    @Input() width: number;
    @Input() height: number;

    /**
     * Data consists of target variable for label und prediction and of position.
     */
    // private _dataA: [[number[]/*label*/, number[]/*prediction*/] /*targetVariable*/,
    //                     [number, number]/*position*/][];
    // private _dataB: [[number[]/*label*/, number[]/*prediction*/] /*targetVariable*/,
    //                     [number, number]/*position*/][];

    private _dataA: any;
    private _dataB: any;
    private _comparedData: ComparisonDataItem[];
    private _configurationData: ConfigurationDataCompare;

    private _comparisonLayoutController: GlyphplotComparisonLayoutController;

       constructor(
      private comparisonCreator: ComparisonDataCreator,
      private movementVisualizer: MovementVisualizer,
      private _logger: Logger,
      private _helper: Helper,
      private _configurationService: ConfigurationCompare,
      private _cursor: LenseCursor,
      private _eventAggregator: EventAggregatorService
    ) {
     super(_logger, _helper, _configurationService, _cursor, _eventAggregator);
      this._configurationData = this._configurationService.configurationData;
      this._configurationData.getDataA().subscribe(msg => this.onMessage(msg, true));
      this._configurationData.getDataB().subscribe(msg => this.onMessage(msg, false));
      this._comparisonLayoutController = new GlyphplotComparisonLayoutController(
        this,
        this._logger,
        this._configurationService
      );

      this._eventAggregator.getEvent(RefreshPlotEvent)
      .subscribe((evt) => {
        // this.animate();
        const x = 3;
      });

    //   this._eventController = new GlyphplotEventController(
    //     this,
    //     this.configuration,
    //     this.cursor,
    //     this.logger,
    //     this.configurationService,
    //     this.eventAggregator
    //   );
    }

    onMessage(msg, isA: boolean) {
      if (msg == null) {return; }
      (isA) ? this._dataA = msg
        : this._dataB = msg;

      if ( this._dataA !== null && this._dataB !== null) {
        this._comparedData = this.comparisonCreator.versions2Data(this._dataA, this._dataB);
        this.createChart();
      }
    }

    ngOnInit() {
       super.ngOnInit();
    }
    ngOnChanges() {
        this.updateZoom();
    }

    createChart(): void {
    const that = this;
    const element = this.chartContainer.nativeElement;
    // this.selectionContext = this.selectionRectangle.nativeElement.getContext('2d');

    this._simulation = d3
      .forceSimulation()
      .force('collision', d3.forceCollide().radius(20))
      .on('end', () => {
        GlyphplotComponent.ticked(that);
      })
      .stop();

    this.layoutController.updatePositions();

    this.context = element.getContext('2d');
    this.animate();

    }

    // public updateZoom() {
    //     const that = this;
    //     const element = this.chartContainer.nativeElement;
    //     const rectangle = this.selectionRectangle.nativeElement;
    //     let scaleBase = 1 *
    //     Math.min(this.height / this._originalHeight, this.width / this._originalWidth);
    //     scaleBase = this.configurationData.minScaleLevel;
    //     this.zoom = d3.zoom()
    //     .scaleExtent([scaleBase, this.configurationData.maxZoom])
    //     .on('start', () => {
    //         GlyphplotComparisonComponent.dragStart(that);
    //     })
    //     .on('zoom', () => {
    //         GlyphplotComparisonComponent.zoomed(that);
    //     })
    //     .on('end', () => {
    //         GlyphplotComparisonComponent.dragEnd(that);
    //     });

    //     const canvas = d3
    //     .select(element)
    //     .attr('width', this.width)
    //     .attr('height', this.height)
    //     .call(this.zoom);

    // }

    draw(): void {
        this.drawLock = true;

        const context = this.context;
        context.save();
        context.clearRect(0, 0, this.width, this.height);

        if (this._configurationService.configurationData.comparisonGlyph instanceof ComparisonMoveGlyph) {
          this.movementVisualizer.init(this._comparedData);
          this.movementVisualizer.initContext(context);
          this.movementVisualizer.initFilter(this._configurationData.connectionFilter)
          this.movementVisualizer.drawConnections(
            this._configurationService.isDrawPositionA);
        } else {
          this._comparedData.forEach(
            g => {
              // g.context = context;
              // g.draw();
          });
        }

        // this._glyphs.forEach();

        // this._layoutController.getPositions().forEach(d => {
        //     this.context.beginPath();
        //     this.context.moveTo(d.position.x, d.position.y);

        //     const data = this._layoutController.getFeaturesForItem(d);


        // this._layoutController.drawSingleGlyph(d.position, data.features, 1.0, true, d.id === this.configuration.idOfHoveredGlyph, 0);

        // });

        // draw

        // context.restore();
        // this.selectionRect.clear();
        this.drawLock = false;

    }

    public animate() {
      //TODO
      if (!arguments.length) {
      this.updateGlyphLayout();
      this.draw();
    }

    }

    public updateGlyphLayout(updateAllItems: boolean = false): void {
      const that = this;
      this._comparedData.forEach(d => {
        if (d.positionA == null || d.positionB == null) {return; }
        d.drawnPositionA = [
          that.transform.applyX(that.xAxis(d.positionA[0])),
          that.transform.applyY(that.yAxis(d.positionA[1]))];
        d.drawnPositionB = [
          that.transform.applyX(that.xAxis(d.positionB[0])),
          that.transform.applyY(that.yAxis(d.positionB[1]))];
      });
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
    
   

    // get selectionRect(): SelectionRect {
    //     return this._selectionRect;
    //   }
    // set selectionRect(value: SelectionRect) {
    // this._selectionRect = value;
    // }
    // get eventController(): GlyphplotEventController {
    //     return this._eventController;
    // }
//   get xAxis() { return this._xAxis; }
//   set xAxis(value: any) { this._xAxis = value; }
//   get yAxis() { return this._yAxis; }
//   set yAxis(value: any) { this._yAxis = value; }
//   get configurationData() { return this._configuration; }
//   set configurationData(value: ConfigurationDataCompare) { this._configuration = value; }
//   get zoom() { return this._zoom; }
//   set zoom(value: any) { this._zoom = value; }
//   get context(): CanvasRenderingContext2D { return this._context; }
//   set context(value: CanvasRenderingContext2D) { this._context = value; }
//   get drawLock() { return this._drawLock; }
//   set drawLock(value: boolean) { this._drawLock = value; }
//   get currentLayout() { return this._currentLayout }
//   set currentLayout(value: any) { this._currentLayout = value; }
//   get quadtree() { return this._quadtree }
//   set quadtree(value: any) { this._quadtree = value; }
//   get clusterPoints() { return this._clusterPoints }
//   set clusterPoints(value: any) { this._clusterPoints = value; }
//   get selectionContext() { return this._selectionContext }
//   set selectionContext(value: any) { this._selectionContext = value; }
//   get layoutController() { return this._layoutController; }
//   get dataUpdated() { return this._dataUpdated; }
//   set dataUpdated(value: boolean) { this._dataUpdated = value; }
  }
