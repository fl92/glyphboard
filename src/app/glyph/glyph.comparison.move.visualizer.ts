import { ColorComputation } from './glyph.comparison.move.colorComputation';
import { DelaunayWrapper } from './glyph.comparison.move.delaunayWrapper';
import { ComparisonGlyph} from './glyph.comparison';
import { Injectable } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';
import { ComparisonDataItem } from 'app/glyphplot/glyphplot.comparison.data_item';
import { ConnectionCompareFilter } from 'app/shared/filter/connection.compare-filter';

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
    }

    public init(
        data: ComparisonDataItem[]) {
            const pointsA = new Map<any, [number, number]> ();
            const pointsB = new Map<any, [number, number]> ();
            const dataWithBothPositions = data.filter(v => v.positionA != null && v.positionB != null)

            // TODO include data with missing positions
            // const dataWithMissingPositions = data.filter(v => v.positionA == null || v.positionB == null)
            dataWithBothPositions.forEach( _data => {
                pointsA.set(_data.objectId, _data.drawnPositionA);
                pointsB.set(_data.objectId, _data.drawnPositionB);
            });
            this._init(pointsA, pointsB, 2, pointsA, pointsB);
    }

    public initContext(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    public initFilter(filter: ConnectionCompareFilter) {
        this.filter = filter;
    }


    public updatePoints(points: Map<any, [number, number]>, isPointsA: boolean) {
        isPointsA ?
            this.pointsA = points :
            this.pointsB = points;
    }

    public drawConnections (drawA: boolean) {
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

        const [minDiff, maxDiff, stdDevDiff] = this.computeMeta(differences);
        const absMaxDiff = Math.max(Math.abs(maxDiff), Math.abs(minDiff));
        const [minMove, maxMove] = this.computeMeta(movements1.concat(movements2));
        this.heatMapComputation.init(stdDevDiff, absMaxDiff);

        connections.forEach(([key1, key2], idx) => {
        const [difference, correlation, movement1, movement2] = characteristics[idx];
        let isUnfiltered = false;
        if (this.filter != null) {
            const normalDiff = difference / absMaxDiff;
            const normalMovement1 = movement1 / maxMove;
            const normalMovement2 = movement2 / maxMove;
            isUnfiltered = !this.filter.connectionConfirmsToFilter(normalDiff, correlation, normalMovement1, normalMovement2);
        }
        this._drawConnection(key1, key2, difference, correlation, movement1, movement2, drawA, isUnfiltered);
        } );
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
        movement1: number, movement2: number, drawA: boolean, isUnfiltered: boolean) {

        if ( movement1 === 0 && movement2 === 0) {return}

        const point1 = (drawA) ? this.pointsA.get(key1) : this.pointsB.get(key1);
        const point2 = (drawA) ? this.pointsA.get(key2) : this.pointsB.get(key2);
        const [x1, y1] = point1;
        const [x2, y2] = point2;


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

        // draws connections to Version B-neighbours in Version A for one object and vice versa
    // public drawFarConnections(context: CanvasRenderingContext2D,
    //     x: number, y: number, currentVersionA: boolean) {

    //     // get key of object
    //     const points = (currentVersionA) ? this.pointsA : this.pointsB;
    //     if (points.size === 0) { return false; }
    //     let key = 0;
    //     let minSqDist = Infinity;
    //     points.forEach(([_x, _y], _key) => {
    //         const [dx, dy] = [x - _x, y - _y];
    //         const sqDist = dx * dx + dy * dy;
    //         if (sqDist < minSqDist) {
    //             minSqDist = sqDist;
    //             key = _key;
    //         };
    //     });

    //     if ( Math.sqrt(minSqDist) > 10) { // TOOD constant
    //         return; }

    //     // connections of opposite Version
    //     let oppositeConnections = (currentVersionA) ? this.connectionsB : this.connectionsA;

    //     // // connections on key
    //     // const connectionsIdc: number[] = [];
    //     // oppositeConnections.forEach( ([attrkey1, attrkey2], connkey) => {
    //     //     if (attrkey1 === key || attrkey2 === key) {
    //     //         connectionsIdc.push(connkey); }
    //     // });

    //     // this.drawConnections5(context, !currentVersionA, connectionsIdc);
    //     const diffs = this.heatMapInit(oppositeConnections);
    //     oppositeConnections = oppositeConnections.filter(([attrkey1, attrkey2], connkey) =>
    //         (attrkey1 === key || attrkey2 === key));

    //     oppositeConnections.forEach(([key1, key2], connIdx) => {
    //         const diff = diffs[connIdx];
    //         this.drawConnection(context, key1, key2, diff, currentVersionA);
    //         } );

    //     return true;
    // }

    
    // public drawConnection(context: CanvasRenderingContext2D,
    //     key1: number, key2: number, diff: number, drawA: boolean) {
    //     const point1 = (drawA) ? this.pointsA.get(key1) : this.pointsB.get(key1);
    //     const point2 = (drawA) ? this.pointsA.get(key2) : this.pointsB.get(key2);
    //     const [x1, y1] = point1;
    //     const [x2, y2] = point2;

    //     const vA1 = this.attrVectorsA.get(key1);
    //     const vA2 = this.attrVectorsA.get(key2);
    //     const vB1 = this.attrVectorsB.get(key1);
    //     const vB2 = this.attrVectorsB.get(key2);

    //     const move1: number[] = []; // vB1 - vA1;
    //     const move2: number[] = []; // vB2 - vA2;
    //     vA1.forEach((xa, key) => {
    //         const xb = vB1[key];
    //         move1.push(xb - xa);
    //     });
    //     vA2.forEach((xa, key) => {
    //         const xb = vB2[key];
    //         move2.push(xb - xa);
    //     });

    //     const move1Mag = this.magnitude(move1);
    //     const move2Mag = this.magnitude(move2);

    //     if ( move2Mag !== 0 || move2Mag !== 0) {

    //         const maxMove = (move1Mag > move2Mag) ? move1 : move2;
    //         const moveCorrelation = (move1Mag !== 0 || move2Mag !== 0) ?
    //                                 2 * (this.sumMagnitude(move1, move2)
    //                                 / this.sumMagnitude(maxMove, maxMove)) - 1 : 0;

    //         const [r, g, b] = this.heatMapComputation.computeColor(diff);
    //         let code1: string;
    //         let code2: string;
    //         if (move1Mag < move2Mag) {
    //             code1 = `rgb(${r},${g},${b},${Math.pow(move1Mag / move2Mag, 2)})`;
    //             code2 = `rgb(${r},${g},${b},${1})`;
    //         } else {
    //             code1 = `rgb(${r},${g},${b},${1})`;
    //             code2 = `rgb(${r},${g},${b},${Math.pow(move2Mag / move1Mag, 2)})`;
    //         }

    //         const grad = context.createLinearGradient( x1, y1, x2, y2);
    //         grad.addColorStop(0, code1);
    //         grad.addColorStop(1, code2);
    //         context.strokeStyle = grad;
    //         context.lineWidth = (moveCorrelation > 0) ?
    //         2 + 3 * Math.pow(moveCorrelation, 2) :
    //         1;
    //         context.beginPath();
    //         context.moveTo(x1 , y1 );
    //         context.lineTo(x2 , y2 );
    //         context.stroke();
    //     }
    // }