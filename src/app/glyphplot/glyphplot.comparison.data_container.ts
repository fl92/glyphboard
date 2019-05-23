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
            item.drawnPositionA
            : item.drawnPositionB;
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

    // needed for tooltips
    get features() {
        const features = [];
        this._dataItems.forEach(item => {
            const featuresObj = {};
            const valuesObj = {'1': {}};

            if (item.valuesA != null && item.valuesB != null) {
                for (const key in item.valuesA.keys) {
                if (item.valuesA.keys.hasOwnProperty(key)
                && item.valuesB.keys.hasOwnProperty(key)) {
                    let valueA = item.valuesA.get(key);
                    let valueB = item.valuesB.get(key);
                    const featureA = item.featuresA.get(key);
                    const featureB = item.featuresB.get(key);
                    featuresObj[key] = Math.abs(featureB - featureA);
                    valueA = valueA == null ? '' : valueA;
                    valueB = valueB == null ? '' : valueB;
                    valuesObj[key] = valueA + ', ' + String(featureA.toFixed(4)) + '..'
                        + ' => ' + valueB + ', ' + String(featureB.toFixed(4)) + '..';
                    }
                }
            }
            const featureObj = {
                id: item.objectId,
                'default-context': '1',
                values: featuresObj,
                features: valuesObj
            };
            features.push(featureObj);
        }, this);
        return features;
    }
}