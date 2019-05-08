// requires Delaunay triangulation package: https://www.npmjs.com/package/delaunay-triangulation
import * as Delaunay from 'delaunay-triangulation';

export class DelaunayWrapper {
    public static computeConnections (points: Map<any, [number, number]> )
            : [any, any][] {

                if (points.size === 2) {
                   const keys =  Array.from(points.keys());
                    return [[keys[0] , keys[1]]];
                }

                const vertices = [];
                const point2Key = new Map<any, number>();

                const connectionsPoints: [any, any][] = [];
                const connections: [any, any][] = [];

                points.forEach(([x, y], key) => {
                    const delPoint = new Delaunay.Point(x, y);
                    vertices.push(delPoint);
                    point2Key.set(delPoint, key);
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
                    const key1 = point2Key.get(p1);
                    const key2 = point2Key.get(p2);
                    connections.push([key1, key2]);
                });
                return connections;
    }
}
