export class MovementVisualizer {

    pointsA: [number, number] [];
    pointsB: [number, number] [];

    connectionsA: [number, number] [];
    connectionsB: [number, number] [];

    attributesSize: number;
    attrVectorsA: number[][];
    attrVectorsB: number[][];

    heatMapComputation = new HeatMapComputation();

    public constructor(pointsA: [number, number] [],
                pointsB: [number, number] [],
                attributesSize: number,
                attrVectorsA: number[][],
                attrVectorsB: number[][]
                ) {
        this.pointsA = pointsA;
        this.pointsB = pointsB;

        this.connectionsA = DelaunayWrapper.computeConnections(pointsA);
        this.connectionsB = DelaunayWrapper.computeConnections(pointsB);

        this.attributesSize = attributesSize;
        this.attrVectorsA = attrVectorsA;
        this.attrVectorsB = attrVectorsB;
    }


public drawConnections4 (context: CanvasRenderingContext2D, drawA: boolean) {
    const connections = (drawA) ? this.connectionsA : this.connectionsB;

    const diffs = this.heatMapInit4(connections);

    connections.forEach(([idx1, idx2], connIdx) => {
       const diff = diffs[connIdx];
       this.drawConnection4(context, idx1, idx2, diff, drawA);
    } );
}

        // draws connections to Version B-neighbours in Version A for one object and vice versa
public drawFarConnections4(context: CanvasRenderingContext2D,
    x: number, y: number, currentVersionA: boolean) {

    // get idx of object
    const points = (currentVersionA) ? this.pointsA : this.pointsB;
    if (points.length === 0) { return false; }
    let idx = 0;
    let minSqDist = Infinity;
    points.forEach(([_x, _y], _idx) => {
        const [dx, dy] = [x - _x, y - _y];
        const sqDist = dx * dx + dy * dy;
        if (sqDist < minSqDist) {
            minSqDist = sqDist;
            idx = _idx;
        } 
    });

    if ( Math.sqrt(minSqDist) > 10) { // TOOD constant
        return; }

    // connections of opposite Version
    let oppositeConnections = (currentVersionA) ? this.connectionsB : this.connectionsA;

    // // connections on idx
    // const connectionsIdc: number[] = [];
    // oppositeConnections.forEach( ([attrIdx1, attrIdx2], connIdx) => {
    //     if (attrIdx1 === idx || attrIdx2 === idx) {
    //         connectionsIdc.push(connIdx); }
    // });

    // this.drawConnections5(context, !currentVersionA, connectionsIdc);
    const diffs = this.heatMapInit4(oppositeConnections);
    oppositeConnections = oppositeConnections.filter(([attrIdx1, attrIdx2], connIdx) =>
        (attrIdx1 === idx || attrIdx2 === idx));

    oppositeConnections.forEach(([idx1, idx2], connIdx) => {
        const diff = diffs[connIdx];
        this.drawConnection4(context, idx1, idx2, diff, currentVersionA);
        } );

    return true;
}

private heatMapInit4(connections: [number, number][]) {
    const diffs: number[] = [];

    let stdDevDiff = 0;
    let maxDiff = 0;
    let minDiff = Infinity;

    connections.forEach(([idx1, idx2]) => {
        const distA = this.diffMagnitude(this.attrVectorsA[idx1], this.attrVectorsA[idx2]);
        const distB = this.diffMagnitude(this.attrVectorsB[idx1], this.attrVectorsB[idx2]);
        const diff = distA - distB;
        diffs.push(diff);
        stdDevDiff += Math.abs(diff);
        maxDiff = Math.max(diff, maxDiff);
        minDiff = Math.min(diff, minDiff);
    });
    stdDevDiff /= diffs.length;


    this.heatMapComputation.init(stdDevDiff, Math.max(Math.abs(maxDiff), Math.abs(minDiff)), ColorMapType.DIVERGING, 1, true);
    return diffs;
}

public drawConnection4(context: CanvasRenderingContext2D,
    idx1: number, idx2: number, diff: number, drawA: boolean) {
    const [x1, y1] = (drawA) ? this.pointsA[idx1] : this.pointsB[idx1];
    const [x2, y2] = (drawA) ? this.pointsA[idx2] : this.pointsB[idx2];

    const vA1 = this.attrVectorsA[idx1];
    const vA2 = this.attrVectorsA[idx2];
    const vB1 = this.attrVectorsB[idx1];
    const vB2 = this.attrVectorsB[idx2];

    const move1: number[] = []; // vB1 - vA1;
    const move2: number[] = []; // vB2 - vA2;
    vA1.forEach((xa, idx) => {
        const xb = vB1[idx];
        move1.push(xb - xa);
    });
    vA2.forEach((xa, idx) => {
        const xb = vB2[idx];
        move2.push(xb - xa);
    });

    const move1Mag = this.magnitude(move1);
    const move2Mag = this.magnitude(move2);

    if ( move2Mag !== 0 || move2Mag !== 0) {

        const maxMove = (move1Mag > move2Mag) ? move1 : move2; // Math.max(move1Mag, move2Mag);
        const moveSimilarity = (move1Mag !== 0 || move2Mag !== 0) ?
                                2 * (this.sumMagnitude(move1, move2)
                                / this.sumMagnitude(maxMove, maxMove)) - 1 : 0;

        const [r, g, b] = this.heatMapComputation.computeColor(diff);
        let code1: string;
        let code2: string;
        if (move1Mag < move2Mag) {
            code1 = `rgb(${r},${g},${b},${Math.pow(move1Mag / move2Mag, 2)})`;
            code2 = `rgb(${r},${g},${b},${1})`;
        } else {
            code1 = `rgb(${r},${g},${b},${1})`;
            code2 = `rgb(${r},${g},${b},${Math.pow(move2Mag / move1Mag, 2)})`;
        }

        const grad = context.createLinearGradient( x1, y1, x2, y2);
        grad.addColorStop(0, code1);
        grad.addColorStop(1, code2);
        context.strokeStyle = grad;
        context.lineWidth = (moveSimilarity > 0) ?
        2 + 3 * Math.pow(moveSimilarity, 2) :
        1;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }
}

}
