import { Glyph } from './glyph';
import { ComparisonGlyph} from './glyph.comparison';
import { stringify } from '@angular/core/src/render3/util';

class HoleGlyphConfig {
  RADIUS_FACTOR = 50;
  LINE_WIDTH = 2;

}

export class ComparisonHoleGlyph extends ComparisonGlyph {

  constructor(context: CanvasRenderingContext2D = null,
     private config = new HoleGlyphConfig()) {
    super(context);
  }

  public draw() {
    const drawTarget = true;
    if (drawTarget) {
      if (this._targetsA === null || this._targetsB === null) {
        return; }
    const [_, predsA] = this._targetsA.get(this._selectedFeature);
    const [labelsB, predsB] = this._targetsB.get(this._selectedFeature);
    const labels = labelsB;

    const [predAIdx, predA] = this.getMax(predsA);
    const [predBIdx, predB] = this.getMax(predsB);
    const [labelIdx, answersFor] = this.getMax(labels);
    const predAClass = this.getTargetPrediction(predAIdx);
    const predBClass = this.getTargetPrediction(predBIdx);
    const labelClass = this.getTargetLabel(labelIdx);
    const confVal = answersFor / labels.reduce((a, b) => a + b, 0);
    this.drawTargetFeature(predAClass, predA,
      predBClass, predB, labelClass, [confVal, answersFor], this._positionB);
    }
  }

  private drawTargetFeature(
    predAClass: string,
    predA: number,
    predBClass: string,
    predB: number,
    labelClass: string,
    interrater: [number, number],
    pos: [number, number]
    ) {
      const possibleClassesLabel = this.getLabelSize();
      const possibleClassesPred = this.getPredictionSize();
      const isCorrectA = predAClass === labelClass;
      const isCorrectB = predBClass === labelClass;
      const hasChanged = predAClass !== predBClass;
      // const isMaybe = labelClass === 2;

      const [x, y] = pos;
      let innerRadius: number;
      let outerRadius: number;
      let innerVal: number;
      let outerVal: number;
      if ( hasChanged) {
        innerVal = (predA);
        outerVal = (predA + predB);
      } else {
        innerVal = 0;
        const min = 1 / possibleClassesPred;
        outerVal = min + (Math.abs(predA - predB));
      }

      innerVal /= 2;
      outerVal /= 2;

      innerRadius = Math.pow(innerVal, 0.7) * this.config.RADIUS_FACTOR;
      outerRadius = Math.pow(outerVal, 0.7) * this.config.RADIUS_FACTOR;
      // innerRadius = Math.pow(innerVal, 0.7) * this.config.RADIUS_FACTOR;
      // outerRadius = Math.pow(outerVal, 0.7) * this.config.RADIUS_FACTOR;
      const innerRoundness = // (isMaybe) ? 0.5 :
                                (isCorrectA) ? 0 : 1;
      const outerRoundness = // (isMaybe) ? 0.5 :
                                (isCorrectB) ? 0 : 1;
      // const innerRoundness = 1;
      // const outerRoundness = 1;

        innerRadius *= Math.pow(1.3, (1 - innerRoundness));
        outerRadius *= Math.pow(1.55, (1 - outerRoundness));
      let colCode: string;
      {
        const minInterrater = (1 / possibleClassesLabel );
        const minS = 0.1;
        const map = this._labelColorMap;
        const h = map.get(labelClass);
        let s = Math.pow(minS + (interrater[0] - minInterrater + minS)
          * ( 1 / (1 - minInterrater + minS)),
           1.3)  * 100;
        const l = 50;
        s = Math.round(s);
        colCode = `hsl( ${h}, ${s}%, ${l}%)`;
      }

      // adoption to perception of circles: https://www.stat.auckland.ac.nz/~ihaka/787/lectures-perception.pdf

      const kernel = new HoleGlyphKernel(this.config, x, y, innerRadius, outerRadius,
        innerRoundness, outerRoundness, colCode);

      kernel.draw(this._context);

    }

    public clone(): ComparisonGlyph {
      return new ComparisonHoleGlyph();
    }
}

class HoleGlyphKernel {

  private static ANGLES: number[] = [
    0.5 * Math.PI / 3,
    2.5 * Math.PI / 3,
    4.5 * Math.PI / 3];
  private static EDGES = HoleGlyphKernel.ANGLES.length;
  private static NORMAL_TRIANGLE: [number, number][];
  private static DIST_FACTOR = (4 / 3) * Math.tan(Math.PI / (2 * HoleGlyphKernel.EDGES));

  static _ctor = (() => {
    HoleGlyphKernel.NORMAL_TRIANGLE = [];
    HoleGlyphKernel.ANGLES.forEach((angle) => {
      HoleGlyphKernel.NORMAL_TRIANGLE.push(
        [Math.cos(angle), Math.sin(angle)]);
    });

  })();

  constructor (
    private config: HoleGlyphConfig,
    private x: number,
    private y: number,
    private innerRadius: number,
    private outerRadius: number,
    private innerRoundness: number, // 1 is round, 0 is not
    private outerRoundness: number,
    private fillColCode: string,
    private strokeColCode: string = null
    ) {

  }
  public draw (context: CanvasRenderingContext2D ) {
      const innerTriangle = this.getTrianglePoints(this.x, this.y, this.innerRadius);
      const innerBezier = this.getBezierPoints(this.x, this.y, this.innerRadius,
        this.innerRoundness);
      const outerTriangle = this.getTrianglePoints(this.x, this.y, this.outerRadius, true);
      const outerBezier = this.getBezierPoints(this.x, this.y, this.outerRadius,
        this.outerRoundness, true);

      const n = HoleGlyphKernel.EDGES;
      const path = new Path2D();
      // ([[innerTriangle, innerBezier], [outerTriangle, outerBezier]])
      const drawInnerOuter = (triangle: [number, number][],
        bezier: [number, number, number, number][]) => {

        let [_x, _y] = triangle[0];
        path.moveTo(_x, _y);

        for (let i = 0; i < n; i++) {
          [_x, _y] = triangle[(i + 1) % n];
          const [_xb1, _yb1, _xb2, _yb2] = bezier[i];
          path.bezierCurveTo(_xb1, _yb1, _xb2, _yb2, _x, _y);
        }
      };

      drawInnerOuter(innerTriangle, innerBezier);
      drawInnerOuter(outerTriangle, outerBezier);
      if ( this.fillColCode !== null) {
        context.fillStyle =  this.fillColCode;
        context.fill(path);
      }
      if ( this.strokeColCode !== null) {
        context.lineWidth = this.config.LINE_WIDTH;
        context.strokeStyle =  this.strokeColCode;
        context.stroke(path);
      }
  }

  private getTrianglePoints(
    x: number, y: number, radius: number,
    isAntiClockwise: boolean = false):
    [number, number][] {
      const buffer: [number, number][] = [];
      if ( isAntiClockwise) {
        for ( let i = HoleGlyphKernel.EDGES - 1; i >= 0; i--) {
          const [dx,  dy] = HoleGlyphKernel.NORMAL_TRIANGLE[i];
          buffer.push([ x + radius * dx, y + radius * dy]);
        }
      } else {
        for ( let i = 0; i < HoleGlyphKernel.EDGES; i++) {
          const [dx,  dy] = HoleGlyphKernel.NORMAL_TRIANGLE[i];
          buffer.push([ x + radius * dx, y + radius * dy]);
        }
      }

      return buffer;
  }

  private getBezierPoints(
    x: number, y: number, radius: number, roundness: number, isAntiClockwise: boolean = false)
  : [number, number, number, number][] {
    // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
    const beziers: [number, number, number, number][] = [];
    const normalBeziers: [number, number, number, number][] = [];
    const n = HoleGlyphKernel.ANGLES.length;
    roundness = Math.pow(roundness, 0.5);
    const DIST_FACTOR = HoleGlyphKernel.DIST_FACTOR * roundness;

    const sign = (isAntiClockwise) ? -1 : +1;
    const computeOneNormalBezier = (i: number) => {
      let angle1 = HoleGlyphKernel.ANGLES[ i ];
      let angle2 = HoleGlyphKernel.ANGLES[ (i + sign + n) % n];
      let [dx1, dy1] = HoleGlyphKernel.NORMAL_TRIANGLE[i];
      let [dx2, dy2] = HoleGlyphKernel.NORMAL_TRIANGLE[(i + sign + n) % n];
      angle1 = angle1 + sign * 0.5 * Math.PI;
      angle2 = angle2 - sign * 0.5 * Math.PI;
      [dx1, dy1] = [dx1 + DIST_FACTOR * Math.cos(angle1),
                  dy1 + DIST_FACTOR * Math.sin(angle1)];
      [dx2, dy2] = [dx2 + DIST_FACTOR * Math.cos(angle2),
                  dy2 + DIST_FACTOR * Math.sin(angle2)];
      normalBeziers.push([dx1, dy1, dx2, dy2]);
    };
    if (isAntiClockwise) {
      for (let i = HoleGlyphKernel.EDGES - 1; i >= 0; i--) {
        computeOneNormalBezier(i);
      }
    } else {
      for (let i = 0; i < HoleGlyphKernel.EDGES; i++) {
        computeOneNormalBezier(i);
      }
    }
        normalBeziers.forEach(([dx1, dy1, dx2, dy2], idx) => {
      beziers.push([x + radius * dx1, y + radius * dy1,
                    x + radius * dx2, y + radius * dy2]);
    });

    return beziers;
  }
}
