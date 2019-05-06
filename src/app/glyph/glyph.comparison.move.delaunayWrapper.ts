// requires Delaunay triangulation package: https://www.npmjs.com/package/delaunay-triangulation
import * as Delaunay from 'delaunay-triangulation';

export class DelaunayWrapper {
    public static computeConnections (points: [number, number][] )
            : [number, number][] {

                if (points.length === 2) {
                    return [[0 , 1]];
                }

                const vertices = [];
                const point2Idx = new Map<any, number>();

                const connectionsPoints: [any, any][] = [];
                const connectionsIdx: [number, number][] = [];

                points.forEach(([x, y], idx) => {
                    const delPoint = new Delaunay.Point(x, y);
                    vertices.push(delPoint);
                    point2Idx.set(delPoint, idx);
                    });

                const triangles: any[] = Delaunay.triangulate(vertices);
                triangles.forEach((triangle) => {
                    const edges: [any, any][] =  [
                        [triangle.p1, triangle.p2],
                        [triangle.p2, triangle.p3],
                        [triangle.p3, triangle.p1]
                    ];
                    edges.forEach(([p1, p2]) => {
                        if (connectionsPoints.every(([_p1, _p2]) => {
                            return (_p1 !== p1 || _p2 !== p2) && (_p1 !== p2 || _p2 !== p1);
                            })) {
                                connectionsPoints.push([p1, p2]);
                        }
                    });
                });

                connectionsPoints.forEach( ([p1, p2]) => {
                    const idx1 = point2Idx.get(p1);
                    const idx2 = point2Idx.get(p2);
                    connectionsIdx.push([idx1, idx2]);
                });
                return connectionsIdx;
    }
}
