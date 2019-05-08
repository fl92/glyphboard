import { ComparisonGlyph } from "./glyph.comparison";

export class ComparisonMoveGlyph extends ComparisonGlyph {

    public draw() {
        throw new Error('method is deprecated');
    }

    public newInstance(): ComparisonGlyph {
        return new ComparisonMoveGlyph();
    }


}