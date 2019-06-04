import { ComparisonGlyph } from './glyph.comparison';

export class ComparisonMoveGlyph extends ComparisonGlyph {
    static RADIUS = 2;

    public draw() {
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
        } else {
            // this._context.beginPath();
            // this._context.strokeStyle = `rgba(0,0,0, 0.3)`;
            // this._context.rect(x, y, 2, 2);
            // this._context.stroke();
        }

    }
}