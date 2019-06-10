import { ComparisonDataItem } from './glyphplot.comparison.data_item';



export class ComparisonDataContainer {

    private _drawA : boolean;

    public constructor (
        private _dataItems: ComparisonDataItem[] = [],
        private _schema: any
    ) {}

    public get drawA(): boolean {
        return this._drawA;
    }
    public set drawA(v: boolean) {
        this._drawA = v;
    }

    get items () {
        return this._dataItems;
    }

    get positions () {
        if (this.items == null) {return null; }
        const positions = [];
        this.items.forEach((item) => {
            const pos = (this.drawA) ?
            item.drawnPositionB
            : item.drawnPositionA;
        const [_x, _y] = (pos != null) ? pos : [null, null];
        const posObj = {
            id: item.objectId,
            position: {
                x: _x, y: _y
            }
        }
        positions.push(posObj);
        }, this );
        return positions;
    }

    get schema() {
        return this._schema;
    }

    get unnamedFeatureVectorLength() {
        const unnamedFeatureVectorLength = this.schema['unnamedFeatureVectorLength'];
        return unnamedFeatureVectorLength;
    }

    // needed for tooltips
    get features() {
        const features = [];
        this._dataItems.forEach(item => {
            const featuresObj = {'1': {}};
            const valuesObj = {};


                const keys = new Set();

                [item.valuesA, item.valuesB, item.featuresA, item.featuresB].forEach(
                    (values) => {
                    if (values != null) {
                        const help = values.keys();
                        Array.from(help).forEach((k) => keys.add(k)); }
                    }
                );
               keys.forEach((key) => {
                    let valueA: any = (item.valuesA != null) ? item.valuesA.get(key) : '';
                    let valueB: any = (item.valuesB != null) ? item.valuesB.get(key) : '';
                    let featureA: any = (item.featuresA != null) ? item.featuresA.get(key) : '';
                    let featureB: any = (item.featuresB != null) ? item.featuresB.get(key) : '';

                    // floats to not more than 4 digits
                    const toFixed = (_v) => {
                        if (! isNaN(_v) && isFinite(_v)) {
                            _v = Number(_v);
                             if ( Math.floor(_v) - _v !== 0) {
                                 _v = _v.toFixed(4);
                             }}
                        return _v;
                    }

                    valueA = toFixed(valueA);
                    valueB = toFixed(valueB);
                    featureA = toFixed(featureA);
                    featureB = toFixed(featureB);

                    const featureComp = (featureA === featureB) ?
                        featureA : '' + featureA + '=>' + featureB;
                    featuresObj['1'][key] = featureComp;

                    const valueComp = (valueA === valueB) ?
                        valueA : '' + valueA + '=>' + valueB;

                    valuesObj[key] = valueComp;
                });

            const featureObj = {
                id: item.objectId,
                'default-context': '1',
                features: featuresObj,
                values: valuesObj
            };
            features.push(featureObj);
        }, this);
        return features;
    }
}