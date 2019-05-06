import { ComparisonGlyph } from "./glyph.comparison";

export class MoveComparisonGlyph extends ComparisonGlyph {
    public draw() {
    }

    public clone(): ComparisonGlyph {
        return new MoveComparisonGlyph();
    }


}