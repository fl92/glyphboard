import { ColorComputation } from './glyph.comparison.move.colorComputation';
import { DelaunayWrapper } from './glyph.comparison.move.delaunayWrapper';
import { ComparisonGlyph} from './glyph.comparison';
import { Injectable } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { ComparisonDataItem } from 'app/glyphplot/glyphplot.comparison.data_item';
import { ConnectionCompareFilter } from 'app/shared/filter/connection.compare-filter';
import { MetadataOverrider } from '@angular/core/testing/src/metadata_overrider';

@Injectable()
export class MovementVisualizer {
    private pointsA: Map<any, [number, number]>;
    private pointsB: Map<any, [number, number]>;

    private connectionsA: [number, number][];
    private connectionsB: [number, number][];

    private attributesSize: number;
    private attrVectorsA: Map<any, [number, number]>;
    private attrVectorsB: Map<any, [number, number]>;

    private heatMapComputation = new ColorComputation();

    private context: CanvasRenderingContext2D;

    private filter: ConnectionCompareFilter;


    private characteristicsA: [number, number, number, number][];
    private characteristicsB: [number, number, number, number][];

    private metaA = {
        minDiff: <number> null,
        maxDiff: <number> null,
        stdDevDiff: <number> null,
        minMove: <number> null,
        maxMove: <number> null
    };
    private metaB = this.metaA;


    public init(
        data: ComparisonDataItem[]) {
            const [pointsA, pointsB] = this.filterPointsWithoutMissingPositions(data);
            this._init(pointsA, pointsB, 2, pointsA, pointsB);
    }

    private _init(pointsA: Map<any, [number, number]>,
                pointsB: Map<any, [number, number]>,
                attributesSize: number,
                attrVectorsA: Map<any, [number, number]>,
                attrVectorsB: Map<any, [number, number]>
                ) {
        this.pointsA = pointsA;
        this.pointsB = pointsB;

        this.connectionsA = DelaunayWrapper.computeConnections(pointsA);
        this.connectionsB = DelaunayWrapper.computeConnections(pointsB);

        this.attributesSize = attributesSize;
        this.attrVectorsA = attrVectorsA;
        this.attrVectorsB = attrVectorsB;

        this.computeCharacteristicsAndMeta(true);
        this.computeCharacteristicsAndMeta(false);
    }

    public initContext(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    public initFilter(filter: ConnectionCompareFilter) {
        this.filter = filter;
    }

    public updatePoints(
        data: ComparisonDataItem[]) {
            const [pointsA, pointsB] = this.filterPointsWithoutMissingPositions(data);
            this._updatePoints(pointsA, true);
            this._updatePoints(pointsB, false);
    }
    public _updatePoints(points: Map<any, [number, number]>, isPointsA: boolean) {
        isPointsA ?
            this.pointsA = points :
            this.pointsB = points;
    }

    private filterPointsWithoutMissingPositions(data: ComparisonDataItem[]) {
        const pointsA = new Map<any, [number, number]> ();
        const pointsB = new Map<any, [number, number]> ();
        const dataWithBothPositions = data.filter(v => v.positionA != null && v.positionB != null)

        // TODO include data with missing positions
        // const dataWithMissingPositions = data.filter(v => v.positionA == null || v.positionB == null)
        dataWithBothPositions.forEach( _data => {
            pointsA.set(_data.objectId, _data.drawnPositionA);
            pointsB.set(_data.objectId, _data.drawnPositionB);
        });
        return [pointsA, pointsB];
    }

    private computeCharacteristicsAndMeta(drawA: boolean) {
        const connections = (drawA) ? this.connectionsA : this.connectionsB;
        const characteristics: [number, number, number, number][] = [];
        const differences: number[] = [];
        const correlations: number[] = [];
        const movements1: number[] = [];
        const movements2: number[] = [];
        connections.forEach(([key1, key2]) => {
            const characteristic = this._computeCharacteristic(key1, key2);
            const [difference, correlation, move1Mag, move2Mag] = characteristic;
            differences.push(difference);
            correlations.push(correlation);
            movements1.push(move1Mag);
            movements2.push(move2Mag);
            characteristics.push(characteristic);
        });
        (drawA) ?
            this.characteristicsA = characteristics :
            this.characteristicsB = characteristics;

        const meta = (drawA) ? this.metaA : this.metaB;
        [meta.minDiff, meta.maxDiff, meta.stdDevDiff] = this.computeMeta(differences);
        [meta.minMove, meta.maxMove] = this.computeMeta(movements1.concat(movements2));
        (drawA) ?
            this.metaA = meta :
            this.metaB = meta;
    }

    public drawConnections (animation: number) {
        const help = this.context.globalAlpha;
        let alpha = this.context.globalAlpha = help * animation;
        if ( alpha !== 0) {
            this._drawConnections(true, true, animation);
        }
        alpha = this.context.globalAlpha = help * (1 - animation);
        if ( alpha !== 0) {
            this._drawConnections(false, false, (1 - animation));
        }
        this.context.globalAlpha = help;
    }

    private _drawConnections (drawAttributA: boolean, drawPointA: boolean = null,
        animation = 0, connectionsIdc: number[] = null) {
        if (drawPointA == null) {
            drawPointA = drawAttributA; }
        const connections = (drawAttributA) ? this.connectionsA : this.connectionsB;

        const characteristics = (drawAttributA) ? this.characteristicsA : this.characteristicsB;
        const meta = (drawAttributA) ? this.metaA : this.metaB;
        const [minDiff, maxDiff, stdDevDiff] = [meta.minDiff, meta.maxDiff, meta.stdDevDiff];
        const absMaxDiff = Math.max(Math.abs(maxDiff), Math.abs(minDiff));
        const [_, maxMove] = [meta.minMove, meta.maxMove];
        this.heatMapComputation.init(stdDevDiff, absMaxDiff);

        const that = this;

        const drawConnectionRoutine = ([key1, key2]: [number, number], idx: number) => {
            const [difference, correlation, movement1, movement2] = characteristics[idx];
            let isUnfiltered = false;
            if (that.filter != null) {
                const normalDiff = difference / absMaxDiff;
                const normalMovement1 = movement1 / maxMove;
                const normalMovement2 = movement2 / maxMove;
                isUnfiltered = !that.filter.connectionConfirmsToFilter(normalDiff, correlation, normalMovement1, normalMovement2);
            }
            that._drawConnection(key1, key2, difference, correlation,
                movement1, movement2, drawPointA, isUnfiltered, animation);
        };
        if (connectionsIdc == null) {
            connections.forEach(drawConnectionRoutine);
        } else {
            connectionsIdc.forEach(idx => {
                const [key1, key2] = connections[idx];
                drawConnectionRoutine([key1, key2], idx);
            });
        }
    }

    public drawFarConnections(pointIds: number[], animation: number) {
        if (pointIds == null || pointIds.length === 0) {
            return};

        const that = this;
        const help = this.context.globalAlpha;
        const drawOrder = (animation < 0.5) ? [false, true] : [true, false];
        drawOrder.forEach( (_drawA) => {
            const oppositeConnections = (_drawA) ? this.connectionsB : this.connectionsA;
            const _animation = (_drawA) ? animation : 1 - animation;
            // const alpha = (_drawA) ? help * animation : help * (1 - animation);

            const connectionsIdc: number[] = [];
            oppositeConnections.forEach(([attrkey1, attrkey2], idx) => {
                const included = pointIds.includes(attrkey1) || pointIds.includes(attrkey2);
                if (included) {
                    connectionsIdc.push(idx);
                }
            });
            // this.context.globalAlpha = alpha;
            that._drawConnections(!_drawA, _drawA, _animation, connectionsIdc);
        });
        this.context.globalAlpha = help;
    }

    private computeMeta( vals: number[])
        : [number, number, number] {
        let min = Infinity;
        let max = -Infinity;
        let absMean = 0;
        if (vals.length !== 0) {
            vals.forEach(val => {
                min = Math.min(val, min);
                max = Math.max(val, max);
                absMean += Math.abs(val);
            });
            absMean /= vals.length;
        }
        return [min, max, absMean];
    }

    private _computeCharacteristic(key1: number, key2: number)
        : [number, number, number, number] {
        const vA1 = this.attrVectorsA.get(key1);
        const vA2 = this.attrVectorsA.get(key2);
        const vB1 = this.attrVectorsB.get(key1);
        const vB2 = this.attrVectorsB.get(key2);

        const move1: number[] = []; // vB1 - vA1;
        const move2: number[] = []; // vB2 - vA2;
        vA1.forEach((xa, key) => {
            const xb = vB1[key];
            move1.push(xb - xa);
        });
        vA2.forEach((xa, key) => {
            const xb = vB2[key];
            move2.push(xb - xa);
        });

        const move1Mag = this.magnitude(move1);
        const move2Mag = this.magnitude(move2);


        const maxMove = (move1Mag > move2Mag) ? move1 : move2;
        const correlation = (move1Mag !== 0 || move2Mag !== 0) ?
                                2 * (this.sumMagnitude(move1, move2)
                                / this.sumMagnitude(maxMove, maxMove)) - 1 : 0;

        const distA = this.diffMagnitude(vA1, vA2);
        const distB = this.diffMagnitude(vB1, vB2);
        const difference = distA - distB;
        return [difference, correlation, move1Mag, move2Mag];

    }
    private _drawConnection(
        key1: number, key2: number, difference: number, correlation: number,
        movement1: number, movement2: number, drawPointA: boolean,
        isUnfiltered: boolean, animation: number) {

        if ( movement1 === 0 && movement2 === 0) {return}

        const point1 = (drawPointA) ? this.pointsA.get(key1) : this.pointsB.get(key1);
        const point2 = (drawPointA) ? this.pointsA.get(key2) : this.pointsB.get(key2);
        const oppPoint1 = (!drawPointA) ? this.pointsA.get(key1) : this.pointsB.get(key1);
        const oppPoint2 = (!drawPointA) ? this.pointsA.get(key2) : this.pointsB.get(key2);
        let [x1, y1] = point1;
        let [x2, y2] = point2;
        const [_x1, _y1] = oppPoint1;
        const [_x2, _y2] = oppPoint2;

        [x1, y1] = [_x1 + animation * (x1 - _x1), _y1 + animation * (y1 - _y1)];
        [x2, y2] = [_x2 + animation * (x2 - _x2), _y2 + animation * (y2 - _y2)];

        const [r, g, b] = (isUnfiltered) ?
            this.heatMapComputation.unfilteredColor :
            this.heatMapComputation.computeColor(difference);
        let code1: string;
        let code2: string;
        if (movement1 < movement2) {
            code1 = `rgb(${r},${g},${b},${Math.pow(movement1 / movement2, 2)})`;
            code2 = `rgb(${r},${g},${b},${1})`;
        } else {
            code1 = `rgb(${r},${g},${b},${1})`;
            code2 = `rgb(${r},${g},${b},${Math.pow(movement2 / movement1, 2)})`;
        }

        const grad = this.context.createLinearGradient( x1, y1, x2, y2);
        grad.addColorStop(0, code1);
        grad.addColorStop(1, code2);
        this.context.strokeStyle = grad;
        this.context.lineWidth = (correlation > 0) ?
        2 + 3 * Math.pow(correlation, 2) :
        1;
        this.context.beginPath();
        this.context.moveTo(x1 , y1 );
        this.context.lineTo(x2 , y2 );
        this.context.stroke();
    }

    private magnitude (v: number[]): number {
        let sum = 0;
        for (let i = 0; i < this.attributesSize; i++) {
        const d =  v[i];
        sum += d * d;
        }
        return Math.sqrt(sum);
    }

    private diffMagnitude (vA: number[], vB: number[]): number {
        let sum = 0;
        for (let i = 0; i < this.attributesSize; i++) {
        const d =  vA[i] - vB[i];
        sum += d * d;
        }
        return Math.sqrt(sum);
    }
    private sumMagnitude (vA: number[], vB: number[]): number {
        let sum = 0;
        for (let i = 0; i < this.attributesSize; i++) {
        const d =  vA[i] + vB[i];
        sum += d * d;
        }
        return Math.sqrt(sum);
    }
}
