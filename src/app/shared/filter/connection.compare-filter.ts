import { FeatureFilter } from "./feature-filter";


export class ConnectionCompareFilter {
    private _minDifference = -1;
    private _maxDifference = 1;
    private _minCorrelation = -1;
    private _maxCorrelation = 1;
    private _minMovement = 0;
    private _maxMovement = 1;

    public connectionConfirmsToFilter (difference: number, correlation: number,
        movement1: number, movement2: number): boolean {
            return correlation >= this._minCorrelation && correlation <= this._maxCorrelation
            && difference >= this._minDifference && difference <= this._maxDifference
            && movement1 >= this._minMovement && movement1 <= this._maxMovement
            && movement2 >= this._minMovement && movement2 <= this._maxMovement;
    }

    /// Difference
    /** Difference is distance change of connected points between compared versions */
    public get minDifference(): number {
        return this._minDifference;
    }
    /** Difference is distance change of connected points between compared versions */
    public get maxDifference(): number {
        return this._minDifference;
    }
    public set minDifference(v: number) {
        this.testRange(v, -1, 1);
        this._minDifference = v;
    }
    public set maxDifference(v: number) {
        this.testRange(v, -1, 1);
        this._minDifference = v;
    }

    /// Correlation
    /** Correlation is similarity of movements of connected points. */
    public get minCorrelation(): number {
        return this._minCorrelation;
    }
    /** Correlation is similarity of movements of connected points. */
    public get maxCorrelation(): number {
        return this._minCorrelation;
    }
    public set minCorrelation(v: number) {
        this.testRange(v, -1, 1);
        this._minCorrelation = v;
    }
    public set maxCorrelation(v: number) {
        this.testRange(v, -1, 1);
        this._minCorrelation = v;
    }


    /// Movement
    /** Magnitude of movement of each connected point */
    public get minMovement(): number {
        return this._minMovement;
    }
    /** Magnitude of movement of each connected point */
    public get maxMovement(): number {
        return this._minMovement;
    }
    public set minMovement(v: number) {
        this.testRange(v, 0, 1);
        this._minMovement = v;
    }
    public set maxMovement(v: number) {
        this.testRange(v, 0, 1);
        this._minMovement = v;
    }

    private testRange(v: number, min: number, max: number) {
        if (v < min || v > max) {
            throw new RangeError(`supplied parameter must be in interval [${min},${max}]`);
          }
    }
}