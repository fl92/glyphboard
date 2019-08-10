// author: Florian Dietz
import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';
import { ColorComputation } from 'app/glyph/glyph.comparison.move.colorComputation';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';

/**
 * This componet is used to define min and max value
 * for filtering within a data set.
 */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'property-config-item',
    templateUrl: './dashboard-property-config.component.html',
    styleUrls: []
  })
export class DashboardPropertyConfigComponent implements OnInit {
    @ViewChild('chart')
    private chartContainer: ElementRef;
    @ViewChild('scale')
    private scaleContainer: ElementRef;
    @Input() label = '';
    @Output() input = new EventEmitter();
    private _min: number;
    private _max: number;
    private readonly WIDTH = 170;
    private readonly HEIGHT = 20;
    private readonly SCALE_HEIGHT = 10;
    startX: number = null;
    documentStartX: number = null;
    documentEndX: number = null;
    endX: number = null;
    private isMoving = false;
    private _startValue: number ;
    private _endValue: number ;
    private context: CanvasRenderingContext2D;
    private scaleContext: CanvasRenderingContext2D;


    private _onDrawScale: (context: CanvasRenderingContext2D,
      w: number, h: number) => void = null;

    private _heatMapComputation: ColorComputation;


    @Input()
    public set min(v: number) {
      this._min = Number(v);
      this.startValue = this._min;
    }
    public get min(): number {
      return this._min;
    }
    @Input()
    public set max(v: number) {
      this._max = Number(v);
      this.endValue = this._max;
    }
    public get max(): number {
      return this._max;
    }

    @Output() startValueChange = new EventEmitter<Number>();
    @Input()
    public get startValue(): number {
      return this._startValue;
    }
    public set startValue(v: number) {
      this._startValue = v;
      this.startValueChange.emit(v);
    }

    @Output() endValueChange = new EventEmitter<Number>();
    @Input()
    public get endValue(): number {
      return this._endValue;
    }
    public set endValue(v: number) {
      this._endValue = v;
      this.endValueChange.emit(v);
    }
    private lock = true;

    constructor(private config: ConfigurationCompare) {}

    onMouseDown(e: MouseEvent) {
      const startDiff = Math.abs(this.startX - e.offsetX);
      const endDiff = Math.abs(this.endX - e.offsetX)
      if (startDiff < endDiff && startDiff < 10) {
        this.startX = this.endX;
        this.endX = e.offsetX;
      } else if (endDiff < startDiff && endDiff < 10) {
        this.endX = e.offsetX;
      } else {
        this.startX = e.offsetX;
        this.endX = this.startX;
      }
      this.isMoving = true;
    }
    @HostListener('window:mousedown', ['$event'])
    onDocumentMouseDown(e: MouseEvent) {
      this.documentStartX = e.clientX;

      if( this.endX != null && this.startX != null) {
        this.documentStartX -= this.endX - this.startX
      }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {

      if (this.startX === this.endX) { // click
        this.startX = null;
        this.endX = null;
        this.startValue = this.min;
        this.endValue = this.max;
        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.input.emit('null');
      }
      this.isMoving = false;
    }

    @HostListener('window:mousemove', ['$event'])
    onDocumentMouseMove(e: MouseEvent) {
      if (this.documentStartX != null && this.isMoving) {
        const delta = e.clientX - this.documentStartX;
        this.endX = this.startX + delta;
      }
      if (this.isMoving) {
        this.moving();
      }
    }

    private moving() {
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.fillRect(this.startX, 0,
        this.endX - this.startX, this.HEIGHT);
      this.context.fillStyle = '#a4d0e5';
      this.context.fill()
      this.context.strokeStyle = 'white';
      this.context.stroke();

      // computeValues
      let start = Math.min(this.startX, this.endX);
      if (start < 0) { start = 0; }
      let end = Math.max(this.startX, this.endX);
      if (end > this.WIDTH) { end = this.WIDTH; }

      this.startValue = this.min
        + (start * (this.max - this.min)) / this.WIDTH;
      this.endValue = this.min
        + (end * (this.max - this.min)) / this.WIDTH;

      this.input.emit('null');
    }

    ngOnInit() {
      this.context = this.chartContainer.nativeElement.getContext('2d');
      this.scaleContext = this.scaleContainer.nativeElement.getContext('2d');
    }

    drawScale ( onDrawScale: (context: CanvasRenderingContext2D,
      w: number, h: number) => void ) {
        this._onDrawScale  = onDrawScale;
        this._onDrawScale(this.scaleContext, this.WIDTH, this.SCALE_HEIGHT);
      }
}
