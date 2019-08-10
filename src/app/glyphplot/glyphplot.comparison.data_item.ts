// author: Florian Dietz

/**
 * This class contains attributes of objects of two versions.
 */
export class ComparisonDataItem {

    private _objectId: any;

    // version A /////////////////////
    // numerical value which is shown in flower and star glyph, only shown in tooltip here
    private _featuresA: Map<any, number> = null; // id -> feature

    // string value, only shown in tooltip here
    private _valuesA: Map<any, string> = null; // id -> value

    // target variables containing Array of label and prediction values
    // each index in targetArr and predictionArr corresponds to a value
    // in one category
    private _targetsA: Map<any, [number[], number[]]> = null; // id -> [targetArr, predArr]

    // position after dimension reduction
    private _positionA: [number, number] = null;

    // position after zooming and panning which is drawn in canvas
    private _drawnPositionA: [number, number] = [null, null];

    // feature vector which is used to compute the characteristics of the edges
    // if null the position is used instead
    private _unnamedFeatureVectorA: number[];

    // version B /////////////////////
    private _featuresB: Map<any, number> = null;
    private _valuesB: Map<any, string> = null;
    private _targetsB: Map<any, [number[], number[]]> = null;
    private _positionB: [number, number] = null;
    private _drawnPositionB: [number, number] = [null, null];
    private _unnamedFeatureVectorB: number[];

    private _targetVariablesMeta: Map<any, {
      targetName: string,
      targetLabel: string[],
      targetPrediction: string[],
    }>;

    public constructor() {}

    public setVersionA(targets: Map<any, [number[], number[]]>,
      position: [number, number], features: Map<any, number>,
      values: Map<any, string>, unnamedFeatureVector: number[]) {
      this._featuresA = features;
      this._valuesA = values;
      this._targetsA = targets;
      this._positionA = position;
      this._drawnPositionA = position;
      this._unnamedFeatureVectorA = unnamedFeatureVector;
    }

    public setVersionB(targets: Map<any, [number[], number[]]>,
      position: [number, number], features: Map<any, number>,
      values: Map<any, string>, unnamedFeatureVector: number[]) {
      this._featuresB = features;
      this._valuesB = values;
      this._targetsB = targets;
      this._positionB = position;
      this._drawnPositionB = position;
      this._unnamedFeatureVectorB = unnamedFeatureVector;
    }

    public set targetVariablesMeta(v: Map<any, {
      targetName: string,
      targetLabel: string[],
      targetPrediction: string[],
    }>) {
      this._targetVariablesMeta = v;
    }

    public getTargetLabel(labelIdx: number, feature: any) {
      const key = feature;
      const targetVariableMeta
        = this._targetVariablesMeta.get(key);
      return targetVariableMeta.targetLabel[labelIdx]
    }
    public getTargetPrediction(labelIdx: number, feature: any) {
      const key = feature;
      const targetVariableMeta
        = this._targetVariablesMeta.get(key);
      return targetVariableMeta.targetPrediction[labelIdx]
    }

    public getLabelSize (feature: any) {
      const key = feature;
      const targetVariableMeta
        = this._targetVariablesMeta.get(key);
      const size = targetVariableMeta.targetLabel.length;
      return size;
    }
    public getPredictionSize (feature: any) {
      const key = feature;
      const targetVariableMeta
        = this._targetVariablesMeta.get(key);
      const size = targetVariableMeta.targetPrediction.length;
      return size;
    }

    public get targetsA () {
      return this._targetsA;
    }

    public get targetsB () {
      return this._targetsB;
    }

    public get positionA () {
      return this._positionA;
    }

    public get positionB () {
      return this._positionB;
    }
    public get featuresA () {
      return this._featuresA;
    }

    public get featuresB () {
      return this._featuresB;
    }
    public get valuesA () {
      return this._valuesA;
    }

    public get valuesB () {
      return this._valuesB;
    }

    public get unnamedFeatureVectorA() {
      return this._unnamedFeatureVectorA;
    }

    public get unnamedFeatureVectorB() {
      return this._unnamedFeatureVectorB;
    }

    public get drawnPositionA(): [number, number] {
      return this._drawnPositionA;
    }
    public set drawnPositionA(v: [number, number]) {
      this._drawnPositionA = v;
    }
    public get drawnPositionB(): [number, number] {
      return this._drawnPositionB;
    }
    public set drawnPositionB(v: [number, number]) {
      this._drawnPositionB = v;
    }

    public get objectId(): any {
      return this._objectId;
    }
    public set objectId(v: any) {
      this._objectId = v;
    }
}
