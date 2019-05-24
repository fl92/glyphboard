import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

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
    WIDTH = 200;
    HEIGHT = 45;
    startX: number = null;
    endX: number = null;
    private isMoving = false;
    private _startValue: number ;
    private _endValue: number ;
    private context: CanvasRenderingContext2D;

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

    @HostListener('mousemove', ['$event'])
    mouseMove(e: MouseEvent) {
      this.mouseMove(e);
    }

    onMouseDown(e: MouseEvent) {
      if (Math.abs(this.startX - e.offsetX) < 5) {
        this.startX = this.endX;
        this.endX = e.offsetX;
      } else if (Math.abs(this.endX - e.offsetX) < 5) {
        this.endX = e.offsetX;
      } else {
        this.startX = e.offsetX;
        this.endX = this.startX;
      }
     
      this.isMoving = true;
    }
    onMouseUp(e: MouseEvent) {

      if (this.startX === this.endX) { // click
        this.startValue = this.min;
        this.endValue = this.max;
        this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.input.emit('null');
      }
      this.isMoving = false;
      // this.startX = null;
      // this.endX = null;
    }
    onMouseLeave(e: MouseEvent) {
      if ( e.offsetX >= this.WIDTH && this.startX != null) {
        this.endX = this.WIDTH;
        this.moving();
      } else if ( e.offsetX <= 0 && this.startX != null) {
        this.endX = 0;
        this.moving();
      }
      this.isMoving = false;
      // this.startX = null;
      // this.endX = null;
    }
    onMouseMove(e: MouseEvent) {
      if (!this.isMoving) {return; }
      this.endX = e.offsetX;

      this.moving();
    }

    private moving() {
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.fillRect(this.startX, 0,
        this.endX - this.startX, this.HEIGHT);
      this.context.fillStyle = '#a4d0e5';
      this.context.fill()
      this.context.strokeStyle = 'white';
      this.context.stroke();

      // this.startX = 50; this.endX = 60;
      // computeValues
      const start = Math.min(this.startX, this.endX);
      const end = Math.max(this.startX, this.endX);
      this.startValue = this.min
        + (start * (this.max - this.min)) / this.WIDTH;
      this.endValue = this.min
        + (end * (this.max - this.min)) / this.WIDTH;

      // this.transform.applyX(this.xAxis)

      this.input.emit('null');
    }

    ngOnInit() {
      this.context = this.chartContainer.nativeElement.getContext('2d');
      // this.xAxis = d3
      // .scaleLinear()
      // .domain([this.min, this.max])
      // .range([5, this.width - 5]);
    }

}