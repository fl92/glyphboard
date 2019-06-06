import { ComparisonDataItem } from 'app/glyphplot/glyphplot.comparison.data_item';

export abstract class ComparisonGlyph {

  private _comparisonDataItem = new ComparisonDataItem();

  protected _context: CanvasRenderingContext2D = null;
  private _selectedFeature: any = null;
  protected _detailLevel = 1; // 1=global, 2=middle, 3=local
  private _isPositionA = true;
  private _animation = 0;

  public constructor() {
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

  newLabeled(): any {
    for ( const feature of Array.from(this.targetsB.keys())) {
      const [labelsA] = this.targetsA.get(feature);
      const [labelsB] = this.targetsB.get(feature);
      const isNew = ((labelsA == null) && (labelsB != null))
        || ((labelsA[0] == null) && (labelsB[0] != null));
    //   const isNew = (this.getMax(labelsA) === [null, null]) && (this.getMax(labelsB) !== [null, null]);
      if (!isNew) {
      return false;
    }
  }
  return true;
}

public get comparisonDataItem(): ComparisonDataItem {
  return this._comparisonDataItem;
}
public set comparisonDataItem(v: ComparisonDataItem) {
  this._comparisonDataItem = v;
}

set detailLevel(value: number) {
    this._detailLevel = value;
}

set selectedFeature(value: any) {
    this._selectedFeature = value;
}

get selectedFeature() {
  let feature = this._selectedFeature;
  const targets = (this.targetsA != null) ? this.targetsA : this.targetsB;
  if (targets == null) {return null; }
  if (!targets.has(feature)) {
    if (targets.size > 0) {
      feature = targets.keys().next().value;
    } else {
      return null;
    }
  }
  return feature;
}

// get selectedFeature() {
//   // if (!this.targetsA.has(feature)) {
//   //   if (this.targetsA.size > 0) {
//   //     feature = this.targetsA.keys().next().value;
//   //   } else {
//   //     return;
//   //   }
//   // }
//   return null;
// }

set context(value: CanvasRenderingContext2D) {
  this._context = value;
}

public set targetVariablesMeta(v: Map<any, {
  targetName: string,
  targetLabel: string[],
  targetPrediction: string[],
}>) {
  this._comparisonDataItem.targetVariablesMeta = v;
}

public getTargetLabel(labelIdx: number): string {
  return this._comparisonDataItem.getTargetLabel(labelIdx,
    this.selectedFeature);
}
public getTargetPrediction(labelIdx: number) {
  return this._comparisonDataItem.getTargetPrediction(labelIdx,
    this.selectedFeature);
}

public getLabelSize() {
  return this._comparisonDataItem.getLabelSize(this.selectedFeature);
}
public getPredictionSize() {
  return this._comparisonDataItem.getPredictionSize(this.selectedFeature);
}

public get isPositionA(): boolean {
    return this._isPositionA;
}


public get animation(): number {
  return this._animation;
}
public set animation(v: number) {
  this._animation = v;
  this._isPositionA = v < .5;
}


public get position (): [number, number] {
  if ( this.positionA == null && this.positionB == null) {
    return null;
  } else if ( this.positionA == null) {
    return this.positionB;
  } else if ( this.positionB == null) {
    return this.positionA;
  }
  const [_xA, _yA] = this.positionA;
  const [_xB, _yB] = this.positionB;

  return [_xA + this.animation * (_xB - _xA),
          _yA + this.animation * (_yB - _yA)];
}

get objectId() {
  return this._comparisonDataItem.objectId;
}
  // get selectedFeature(): any {
  //   return this._selectedFeature;
  // }
  get detailLevel() {
    return this._detailLevel;
  }
  // get extractedsA() {
  //   return this._comparisonDataItem.extractedsA
  // }
  get targetsA() {
    return this._comparisonDataItem.targetsA;
  }
  // get extractedsB(){
  //   return this._comparisonDataItem.extractedsB
  // }
  get targetsB() {
    return this._comparisonDataItem.targetsB;
  }
  get positionA() {
    return this._comparisonDataItem.drawnPositionA;
  }
  get positionB() {
    return this._comparisonDataItem.drawnPositionB;
  }
}
