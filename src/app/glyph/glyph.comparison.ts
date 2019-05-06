export abstract class ComparisonGlyph {

    protected _context: CanvasRenderingContext2D = null;
    protected _selectedFeature: any = null;
    protected _detailLevel = 1; // 1=global, 2=middle, 3=local
    // protected _extractedsA: Map<any, number> = null;
    protected _targetsA: Map<any, [number[], number[]]> = null;
    // protected _extractedsB: Map<any, number> = null;
    protected _targetsB: Map<any, [number[], number[]]> = null;
    protected _positionA: [number, number] = null;
    protected _positionB: [number, number] = null;

    private _targetVariablesMeta: Map<any, {
      targetName: string,
      targetLabel: string[],
      targetPrediction: string[],
    }>;

    protected _labelColorMap = new Map<string, number>();

    public constructor(context: CanvasRenderingContext2D = null) {
      this.context = context;
      this._labelColorMap.set('yes', 0);
      this._labelColorMap.set('no', 300);
      this._labelColorMap.set('maybe', 150);
    }

    public abstract draw();

    protected getMax(z: number[]): [number, number] {

      let mz = 0, mZ = 0;
      if ( z == null) {
        return [null, null];
      }
      for (let i = 0; i < z.length; i++) {
        if ( z[i] > mz ) {
          mz =  z[i];
          mZ = i;
        }
      }
      if ( mz === 0) {
        return [null, null];
      }
      return [mZ, mz];
    }

    public abstract clone (): ComparisonGlyph;

    newLabeled(): any {
      for ( const feature of Array.from(this._targetsB.keys())) {
        const [labelsA] = this._targetsA.get(feature);
        const [labelsB] = this._targetsB.get(feature);
        const isNew = ((labelsA == null) && (labelsB != null))
          || ((labelsA[0] == null) && (labelsB[0] != null));
      //   const isNew = (this.getMax(labelsA) === [null, null]) && (this.getMax(labelsB) !== [null, null]);
       if (!isNew) {
       return false;
      }
    }
    return true;
  }

  public setVersionA(/*extracteds: Map<any, number>,*/ targets: Map<any, [number[], number[]]>,
    position: [number, number]) {
    // this._extractedsA = extracteds;
    this._targetsA = targets;
    this._positionA = position;
  }

  public setVersionB(/*extracteds: Map<any, number>,*/ targets: Map<any, [number[], number[]]>,
    position: [number, number]) {
    // this._extractedsB = extracteds;
    this._targetsB = targets;
    this._positionB = position;
  }

  set detailLevel(value: number) {
      this._detailLevel = value;
  }

  set selectedFeature(value: any) {
      this._selectedFeature = value;
  }

  set context(value: CanvasRenderingContext2D) {
    this._context = value;
  }

  public set targetVariablesMeta(v: Map<any, {
    targetName: string,
    targetLabel: string[],
    targetPrediction: string[],
  }>) {
    this._targetVariablesMeta = v;
  }

  public getTargetLabel(labelIdx: number) {
    const key = this._selectedFeature;
    const targetVariableMeta
      = this._targetVariablesMeta.get(key);
    return targetVariableMeta.targetLabel[labelIdx]
  }
  public getTargetPrediction(labelIdx: number) {
    const key = this._selectedFeature;
    const targetVariableMeta
      = this._targetVariablesMeta.get(key);
    return targetVariableMeta.targetPrediction[labelIdx]
  }

  public getLabelSize() {
    const key = this._selectedFeature;
    const targetVariableMeta
      = this._targetVariablesMeta.get(key);
    const size = targetVariableMeta.targetLabel.length;
    return size;
  }
  public getPredictionSize() {
    const key = this._selectedFeature;
    const targetVariableMeta
      = this._targetVariablesMeta.get(key);
    const size = targetVariableMeta.targetPrediction.length;
    return size;
  }

}
