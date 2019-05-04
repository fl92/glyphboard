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
import {GlyphplotComparisonLayoutController} from './glyphplot.comparisonLayout.controller'
import { GlyphLayout } from 'app/glyph/glyph.layout';
import { DotGlyphConfiguration } from 'app/glyph/glyph.dot.configuration';
import { ComparisonGlyph } from 'app/glyph/glyph.comparison';
import { ComparisonGlyphCreator } from 'app/glyph/glyph.comparison.creator';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';


@Component({
    selector: 'app-glyphplot-comparison',
    // templateUrl: './glyphplot.component.html',
    styleUrls: ['./glyphplot.component.css'],
    template: '<div>Hallo Compare</div>'
  })
  export class GlyphplotComparisonComponent implements OnInit, OnChanges {
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
    private _glyphs: ComparisonGlyph[] = [];
    private _glyphsCreator = new ComparisonGlyphCreator();
    // private _answerCategories: string[];
    // private _targetNames: string[]
    private _configuration: ConfigurationDataCompare;
    private _context: CanvasRenderingContext2D;
    // private _selectionContext: any;
    // private _xAxis: any;
    // private _yAxis: any;
    // private _originalWidth: number;
    // private _originalHeight: number;
    // private _transform: any = d3.zoomIdentity;
    private _selectionRect: SelectionRect;
    // private _eventController: GlyphplotEventController;
    private _layoutController: GlyphplotComparisonLayoutController;
    // private _flexiWallController: FlexiWallController;
    // private _circle: Glyph;
    // private _simulation: any;
    // private _currentLayout: any;
    private _drawLock: boolean;
    // private _suppressAnimations = false;
    // private _uniqueID: string;
    // private _zoom: any;
    // private _quadtree: any;
    // private _clusterPoints;
    // private _dataUpdated: boolean;

    // private _data: any;

    constructor(
      private configurationService: ConfigurationCompare,
    ) {
      this.configuration = this.configurationService.configurationData; // this.configurationService.addConfiguration();
      this.configuration.getDataA().subscribe(msg => this.onMessage(msg, true));
      this.configuration.getDataB().subscribe(msg => this.onMessage(msg, false));
      // this.configuration.getData
      // this.configuration.
    }

    onMessage(msg, isA: boolean) {
      if (msg === undefined || msg === null) {return; }
      const x = msg;
    }

    ngOnInit() {

    }
    ngOnChanges() {

    }

    createChart(): void {

    }

    draw(): void {
        this.drawLock = true;

        const context = this.context;
        context.save();
        context.clearRect(0, 0, this.width, this.height);

        this._glyphs.forEach(g => {
            g.context = context;
            g.draw();
        });

        // this._layoutController.getPositions().forEach(d => {
        //     this.context.beginPath();
        //     this.context.moveTo(d.position.x, d.position.y);

        //     const data = this._layoutController.getFeaturesForItem(d);


        // this._layoutController.drawSingleGlyph(d.position, data.features, 1.0, true, d.id === this.configuration.idOfHoveredGlyph, 0);

        // });

        // draw

        context.restore();
        this.selectionRect.clear();
        this.drawLock = false;

    }

    private updateGlyphConfiguration() {
        this._glyphs = this._glyphsCreator.json2Glyphs(this._dataA, this._dataB);
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

    get selectionRect(): SelectionRect {
        return this._selectionRect;
      }
    set selectionRect(value: SelectionRect) {
    this._selectionRect = value;
    }
//   get xAxis() { return this._xAxis; }
//   set xAxis(value: any) { this._xAxis = value; }
//   get yAxis() { return this._yAxis; }
//   set yAxis(value: any) { this._yAxis = value; }
  get configuration() { return this._configuration; }
  set configuration(value: ConfigurationDataCompare) { this._configuration = value; }
//   get zoom() { return this._zoom; }
//   set zoom(value: any) { this._zoom = value; }
  get context(): CanvasRenderingContext2D { return this._context; }
  set context(value: CanvasRenderingContext2D) { this._context = value; }
  get drawLock() { return this._drawLock; }
  set drawLock(value: boolean) { this._drawLock = value; }
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