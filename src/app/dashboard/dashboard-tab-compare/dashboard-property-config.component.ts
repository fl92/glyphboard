import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';
import { ColorComputation } from 'app/glyph/glyph.comparison.move.colorComputation';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'property-config-item',
    // templateUrl: './dashboard-property-config.component.html',
    templateUrl: './dashboard-property-config.component.html',
    styleUrls: []
  })
export class DashboardPropertyConfigComponent implements OnInit {
    @ViewChild('chart')
    private chartContainer: ElementRef;
    @Input() label = '';
    @Output() input = new EventEmitter();
    private _min: number;
    private _max: number;
    WIDTH = 170;
    HEIGHT = 20;
    startX: number = null;
    documentStartX: number = null;
    documentEndX: number = null;
    endX: number = null;
    private isMoving = false;
    private _startValue: number ;
    private _endValue: number ;
    private context: CanvasRenderingContext2D;

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

    // @Input()
    // public set heatMapComputation(v: ColorComputation) {
    //   this._heatMapComputation = v;
    //   this._heatMapComputation.onChanged
    //   = () => {
    //     const x = 0;
    //     // for(let i = 0; i <)
    //     // this.configurationDataCompare
    //     // .heatMapComputation.computeColorII()
    //   };
    // }

    constructor(private config: ConfigurationCompare) {
      // const heatMap = config
      //   .configurationCompareData.heatMapComputation;
      // heatMap.onChanged
      //     = () => {
      //         const step = 2 * (heatMap.max / this.WIDTH);
      //         for (let x = 0, heat = -heatMap.max;
      //           x < this.WIDTH; x++, heat += step) {
      //             const col = heatMap.computeColorII(heat, heatMap.maxAlpha, false);
      //             this.context.beginPath();
      //             this.context.fillStyle = col;
      //             this.context.rect(x, 0, 2, 10);
      //             this.context.fill();
      //         }
      //       };
    }

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
    }

}