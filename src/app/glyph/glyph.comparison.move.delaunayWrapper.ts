// author: Florian Dietz

// requires Delaunay triangulation package: https://www.npmjs.com/package/delaunay-triangulation
import * as Delaunay from 'delaunay-triangulation';


/**
 * This class computes connections resulting from Delaunay triangulation
 * for any set of 2d Points using an extern package
 */
export class DelaunayWrapper {

    /**
     * @param points Map key -> point as Map<key, [x, y]>
     * @returns array of connections as [key1, key2]
     */
    public static computeConnections (points: Map<any, [number, number]> )
            : [any, any][] {

                // algorithm would not work correct if there were points on the same
                // position
                points = this.shiftDoublings(points);

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


                    // const [p1, p2] = edges.values().next().value;
                    // connectionsPoints.push([p1, p2]);
                });

                connectionsPoints.forEach( ([p1, p2]) => {
                    const key1 = point2Key.get(p1);
                    const key2 = point2Key.get(p2);
                    connections.push([key1, key2]);
                });
                return connections;
    }

    public static shiftDoublings (points: Map<any, [number, number]> )
    : Map<any, [number, number]> {
        const pointsArr = Array.from(points);
        points.forEach(([x, y], key) => {
            const hasDouble =
                !pointsArr.every(([_key, [_x, _y]]) => {
                    const noDouble = (_x !== x || _y !== y) || _key === key
                    if (!noDouble) {
                        return false;
                    }
                    return true;
                }
                );
            if (hasDouble) {
                const i = 0;
                x += Math.random() * 0.00000001;
                y += Math.random() * 0.00000001;
                points.set(key, [x, y]);
            }
        } );

        return points;
    }
}
