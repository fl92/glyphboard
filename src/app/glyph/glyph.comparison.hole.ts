import { ComparisonGlyph} from './glyph.comparison';
import { HoleGlyphConfig } from './glyph.comparison.hole.config';
import { HoleGlyphKernel } from './glyph.comparison.hole.kernel';

export class ComparisonHoleGlyph extends ComparisonGlyph {

  protected _labelColorMap = new Map<string, number>();
  private config = new HoleGlyphConfig();

  constructor() {
    super();

    this._labelColorMap.set('yes', 0);
    this._labelColorMap.set('no', 300);
    this._labelColorMap.set('maybe', 150);
  }

  public draw() {
    const drawTarget = true;
    if (drawTarget) {
      if (this.targetsA === null || this.targetsB === null) {
        return; }

      const position = this.position;
      if (position == null) {
        return; // can't draw without position.
      }

      const feature = this._selectedFeature;
      if (!this.targetsA.has(feature)) {
        throw Error('unknown target feature');
      }
      const [_, predsA] = this.targetsA.get(feature);
      const [labelsB, predsB] = this.targetsB.get(feature);
      const labels = labelsB;

      const [predAIdx, predA] = this.getMax(predsA);
      const [predBIdx, predB] = this.getMax(predsB);
      const [labelIdx, answersFor] = this.getMax(labels);
      const predAClass = this.getTargetPrediction(predAIdx);
      const predBClass = this.getTargetPrediction(predBIdx);
      const labelClass = this.getTargetLabel(labelIdx);
      const confVal = answersFor / labels.reduce((a, b) => a + b, 0);
      this.drawTargetFeature(predAClass, predA,
        predBClass, predB, labelClass, [confVal, answersFor], this.position);
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
}

