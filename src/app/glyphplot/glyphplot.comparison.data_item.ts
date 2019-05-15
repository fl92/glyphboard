export class ComparisonDataItem {

    private _objectId: any;
    // private _extractedsA: Map<any, number> = null;
    private _targetsA: Map<any, [number[], number[]]> = null;
    private _positionA: [number, number] = null;
    private _drawnPositionA: [number, number] = [null, null];
    // private _extractedsB: Map<any, number> = null;
    private _targetsB: Map<any, [number[], number[]]> = null;
    private _positionB: [number, number] = null;
    private _drawnPositionB: [number, number] = [null, null];

    private _targetVariablesMeta: Map<any, {
      targetName: string,
      targetLabel: string[],
      targetPrediction: string[],
    }>;

    public constructor() {
    }

    public setVersionA(/*extracteds: Map<any, number>,*/ targets: Map<any, [number[], number[]]>,
      position: [number, number]) {
      // this._extractedsA = extracteds;
      this._targetsA = targets;
      this._positionA = position;
      this._drawnPositionA = position;
    }

    public setVersionB(/*extracteds: Map<any, number>,*/ targets: Map<any, [number[], number[]]>,
      position: [number, number]) {
      // this._extractedsB = extracteds;
      this._targetsB = targets;
      this._positionB = position;
      this._drawnPositionB = position;
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