import { ComparisonGlyph} from './glyph.comparison';
import { HoleGlyphConfig } from './glyph.comparison.hole.config';
import { HoleGlyphKernel } from './glyph.comparison.hole.kernel';

export class ComparisonHoleGlyph extends ComparisonGlyph {

  protected _labelColorMap = new Map<string, number>();
  private config = new HoleGlyphConfig();

  constructor() {
    super();

    this._labelColorMap.set('yes', 249);
    this._labelColorMap.set('no', 345.4);
    this._labelColorMap.set('maybe', 309.2);
  }

  public draw() {
      const position = this.position;
      if (position == null) {
        return; // can't draw without position.
      }

      const feature = this.selectedFeature;

      const [labelsA, predsA] = this.targetsA != null ?
          this.targetsA.get(feature) : [null, null];
      const [labelsB, predsB] = this.targetsB != null ?
          this.targetsB.get(feature) : [null, null];

      const isNewLabeled = labelsA == null && labelsB != null
      const labels = labelsB; // only consider newer Label of both

      const [predAIdx, predA] = (predsA != null) ? this.getMax(predsA) : [null, null];
      const [predBIdx, predB] = (predsB != null) ? this.getMax(predsB) : [null, null];
      const [labelIdx, answersFor] = (labels != null) ? this.getMax(labels) : [null, null];
      const predAClass = (predAIdx != null) ? this.getTargetPrediction(predAIdx) : null;
      const predBClass = (predBIdx != null) ? this.getTargetPrediction(predBIdx) : null;
      const labelClass = (labelIdx != null) ? this.getTargetLabel(labelIdx) : null;
      const confVal = (labels != null) ? answersFor / labels.reduce((a, b) => a + b, 0) : null;
      this.drawTargetFeature(predAClass, predA,
        predBClass, predB, labelClass, [confVal, answersFor], isNewLabeled, this.position);
  }

  private drawTargetFeature(
    predAClass: string,
    predA: number,
    predBClass: string,
    predB: number,
    labelClass: string,
    interrater: [number, number],
    isNewLabeled: boolean,
    pos: [number, number]
    ) {
      const isCorrectA = predAClass === labelClass || labelClass == null;
      const isCorrectB = predBClass === labelClass || labelClass == null;
      const hasChanged = predAClass !== predBClass;
      const isLabelded = labelClass != null;
      const isNew = predAClass == null; // dataobject added between compared versions
      const isRemoved = predBClass == null; // dataobject removed between compared versions

      const [x, y] = pos;
      let innerRadius: number;
      let outerRadius: number;
      let innerVal: number;
      let outerVal: number;

      if (isNew && isRemoved) {

        innerVal = 0;
        outerVal = 0.3;
      } else if ( isNew) {// new means no old prediction
        innerVal = 0;
        outerVal = predB;
      } else if (isRemoved) {// removed means no new prediction
        innerVal = predA;
        outerVal = 0;
      } else if ( hasChanged) {// prediction class has changed,
                              // prediction scores are summed
        innerVal = (predA);
        outerVal = (predA + predB);
      } else { // prediction class has not changed
              // difference of prediction scores plus minimum is built
        const possibleClassesPred = this.getPredictionSize();
        innerVal = 0;
        const min = 1 / possibleClassesPred;
        outerVal = min + (Math.abs(predA - predB));
      }

      // mapping to [0,1]
      innerVal /= 2;
      outerVal /= 2;

      // 1st optimation adoption to perception of circles:
      // see slides 55 und following https://www.stat.auckland.ac.nz/~ihaka/787/lectures-perception.pdf 
      innerRadius = Math.pow(innerVal, 0.7) * this.config.RADIUS_FACTOR;
      outerRadius = Math.pow(outerVal, 0.7) * this.config.RADIUS_FACTOR;
      const innerRoundness = isLabelded ?
                                ((isCorrectA) ? 0 : 1)
                                : 1;
      const outerRoundness = isLabelded ?
                                ((isCorrectB) ? 0 : 1)
                                : 1;

      // 2nd optimation triangle and circle should not overlapp
      innerRadius *= Math.pow(1.30, (1 - innerRoundness));
      outerRadius *= Math.pow(1.55, (1 - outerRoundness));

      // color for glyph
      let colCode: string;
      if (isRemoved) {
        colCode = 'black';
      } else if (isLabelded) { // Typ A labeled Glyph
        const possibleClassesLabel = this.getLabelSize();
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
      } else { // Typ B unlabeled Glyph
        const map = this._labelColorMap;
        const h = (!isRemoved) ? map.get(predBClass) : map.get(predAClass);
        let s = 100;
        const l = 90;
        s = Math.round(s);
        colCode = `hsl( ${h}, ${s}%, ${l}%)`;
      }
      const strokeColCode: string = (isNew || isNewLabeled) ? 'black' : null;

      const kernel = new HoleGlyphKernel(this.config, x, y, innerRadius, outerRadius,
        innerRoundness, outerRoundness, colCode, strokeColCode);

      kernel.draw(this._context);

    }
}

