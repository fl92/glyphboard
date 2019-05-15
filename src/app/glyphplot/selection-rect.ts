import { GlyphplotComponent } from './glyphplot.component';

export class SelectionRect {
  private component: GlyphplotComponent;
  private context: any;
  private _helper;
  private _animationIntervalId: number;
  private _animationProgress = 0;
  private _data: any;

  private _start: any = { x: -1, y: -1 };
  private _end: any = { x: -1, y: -1 };
  private _offset: any = { x: 0, y: 0 };

  // x, y are standardized 0..1
  static applyEasing(x: number): number {
    const a = 1.25; // steepness of ease-in-out, 1 is linear
    return Math.pow(x, a) / (Math.pow(x, a) + Math.pow((1 - x), a));
  }

  static animationTick(component: SelectionRect): any {
    return () => {
      component.increaseAnimationProgress();
      component.onTicked();
    }
  }

  public onTicked(): void {
    this.drawHighlightedGlyph();
  }

  constructor(component: GlyphplotComponent, context: any, helper: any) {
    this.context = context;
    this._helper = helper;
    this.component = component;
  }

  public draw(event: any): void {
    if (!arguments.length) { return; }
    if (event.type !== 'zoom') { return; }

    this.clear();
    this.context.save();

    this.context.lineWidth = 1;
    this.context.setLineDash([4, 2]);
    this.context.strokeStyle = 'rgba(48, 48, 48, .73)';

    const w = event.sourceEvent.offsetX - this.start.x;
    const h = event.sourceEvent.offsetY - this.start.y;

    this.end.x = this.start.x + w;
    this.end.y = this.start.y + h;

    this.context.strokeRect(this.start.x + this.offset.x, this.start.y + this.offset.y, w, h);

    this.context.restore();
  }

  public clear() {
    this.context.save();
    this.context.clearRect(
      this.offset.x,
      this.offset.y,
      this.component.width,
      this.component.height);
    this.context.restore();
  }

  public get selectedGlyphs(): any {
    const selectedArea = { start: this._start, end: this._end };

    // create independence from direction of selection-movement
    const top: number = (selectedArea.end.y < selectedArea.start.y)
      ? selectedArea.end.y
      : selectedArea.start.y;
    const bottom: number = (top === selectedArea.end.y)
      ? selectedArea.start.y
      : selectedArea.end.y;
    const left: number = (selectedArea.end.x < selectedArea.start.x)
      ? selectedArea.end.x
      : selectedArea.start.x;
    const right: number = (left === selectedArea.end.x)
      ? selectedArea.start.x
      : selectedArea.end.x;

    const filteredData = Object.create(this._data);

    const selectedIds = [];
    filteredData.positions = filteredData.positions.filter((elem) => {
      const position = elem.position;
      if (!this._helper.checkClipping(position)
         && position.x > left && position.x < right
         && position.y > top && position.y < bottom) {
        selectedIds.push(elem.id);
        return true;
      };
    });

    filteredData.features = filteredData.features.filter((elem) => {
      return selectedIds.indexOf(elem.id) !== -1;
    });

    return filteredData;
  }

  public increaseAnimationProgress() {
    this._animationProgress += 0.01;
    if (this._animationProgress > 1) {
      this._animationProgress = 0;
    }
  }

  public drawHighlightedGlyph() {
    if  (this.component.configuration.showHighlightInNormalMode || this.component.configuration.useDragSelection) {
      // draw highlighted glyph
      const idOfHoveredGlyph = this.component.configuration.idOfHoveredGlyph;
      if (idOfHoveredGlyph !== undefined && idOfHoveredGlyph !== -1) {
        let hoveredGlyph;
        for (const glyph of this.component.data.positions) {
          if (glyph.id === idOfHoveredGlyph) {
            hoveredGlyph = glyph;
            break;
          }
        }

        this.clear();
        this.context.save();
        const featuresOfHoveredGlyph = this.component.layoutController.getFeaturesForItem(hoveredGlyph);
        this.component.circle.context = this.context;
        this.component.configuration.glyph.context = this.context;
        const positions = {
          x: hoveredGlyph.position.x + (this.offset.x),
          y: hoveredGlyph.position.y + (this.offset.y)
        };
        this.component.layoutController.drawSingleGlyph(
          positions,
          featuresOfHoveredGlyph.features,
          null,
          false,
          true,
          SelectionRect.applyEasing(this._animationProgress));
        this.context.restore();
        this.component.circle.context = this.component.context;
        this.component.configuration.glyph.context = this.component.context;

        if (this._animationIntervalId === undefined || this._animationIntervalId === null) {
          this._animationIntervalId = window.setInterval(SelectionRect.animationTick(this), 10);
        } else {
          if (this._animationProgress >= 1) {
            this._animationProgress = 0;
          }
        }
      } else if (this._animationIntervalId !== undefined && this._animationIntervalId !== null) {
        clearInterval(this._animationIntervalId);
        this._animationIntervalId = undefined;
        this._animationProgress = 0;
      }
    }
  }

  //#region Getters and Setters
  public get start(): any { return this._start; }
  public set start(start: any) {
    this._start = start;
  }

  public get end(): any { return this._end; }
  public set end(end: any) {
    this._end = end;
  }

  public get offset(): any { return this._offset; }
  public set offset(value: any) {
    this._offset = value;
    this.context.canvas.height = window.innerHeight;
    this.context.canvas.width = window.innerWidth;
  }

  public set data(_data: any) {
    this._data = _data;
  }

  public get helper() {
    return this._helper;
  }
  //#endregion
}
