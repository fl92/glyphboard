// author: Florian Dietz
import { ComparisonGlyph } from './glyph.comparison';

/**
 * This class visualizes additionally to move.visualizer.ts
 * certain objects (removed ones, new ones, filtered ones).
 *
 * Furthermore it indicates when to use the move visualization (see glyph.comparison.move.visualization)
 */
export class ComparisonMoveGlyph extends ComparisonGlyph {
    static RADIUS = 2;
    static FILTERED_RADIUS = 5;

    public draw(isFiltered = false) {
        const isNew = this.positionA == null;
        const isRemoved = this.positionB == null;
        if ( this.position == null) {return; }
        const [x, y] = this.position;
        if (isNew) {
            this._context.beginPath();
            this._context.ellipse(x, y, ComparisonMoveGlyph.RADIUS,
                ComparisonMoveGlyph.RADIUS, 0, 0, 2 * Math.PI);
            this._context.strokeStyle = `rgba(70,70,70,${this.animation})`;
            this._context.lineWidth = 2;
            this._context.stroke();
        } else if (isRemoved) {
            this._context.beginPath();
            this._context.ellipse(x, y, ComparisonMoveGlyph.RADIUS,
                ComparisonMoveGlyph.RADIUS, 0, 0, 2 * Math.PI);
            this._context.fillStyle = `rgba(70,70,70,${1 - this.animation})`
            this._context.fill();
        } else if (isFiltered) {
            this._context.beginPath();
            this._context.strokeStyle = `#530d63`;
            this._context.lineWidth = 4;
            this._context.ellipse(x, y, ComparisonMoveGlyph.FILTERED_RADIUS,
                ComparisonMoveGlyph.FILTERED_RADIUS, 0, 0, 2 * Math.PI);
            this._context.stroke();
        } else {
            // this._context.beginPath();
            // this._context.strokeStyle = `rgba(0,0,0, 0.3)`;
            // this._context.rect(x, y, 2, 2);
            // this._context.stroke();
        }

    }
}