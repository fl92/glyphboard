import { ComparisonDataItem } from "app/glyphplot/glyphplot.comparison.data_item";


export abstract class ComparisonAggregateGlyph {

private _comparisonDataItems: ComparisonDataItem[];
public get comparisonDataItems(): ComparisonDataItem[] {
    return this._comparisonDataItems;
}
public set comparisonDataItems(v: ComparisonDataItem[]) {
    this._comparisonDataItems = v;
}

}

export abstract class ComparisonAggregateHoleGlyph {
    public draw(isFiltered: boolean = false) {
        const feature = 0; // = this.selectedFeature;
    }
}