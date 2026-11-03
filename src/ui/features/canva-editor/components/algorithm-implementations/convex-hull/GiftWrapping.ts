import type { Point } from "../math/Point";

export class GiftWrapping {
    /**
     * Computes if the point `z` is on the right side of the line given by points `x` and `y`.
     */
    private static pointOnRightSide(x: Point, y: Point, z: Point) {
        const determinant = (y.x - x.x) * (z.y - x.y) - (y.y - x.y) * (z.x - x.x);
        return determinant > 0;
    }

    /**
     * Returns flat array of points forming convex hull for `points`.
     */
    public static computePointsInConvexHull(points: Point[]) {
        // Elementary conditions.
        if (points.length === 0) {
            return [];
        } else if (points.length < 3) {
            return points.flatMap((point) => [point.x, point.y]);
        }

        // Find the extreme (y-min).
        const pivot = points.reduce((lowest, point) => {
            if (point.y < lowest.y || (point.y === lowest.y && point.x < lowest.x)) {
                return point;
            }

            return lowest;
        });

        const convexHull = [];
        convexHull.push(pivot.x, pivot.y);

        // Current point in convex hull.
        let p = pivot;
        // Best candidate for convex hull.
        let q: Point;

        do {
            q = points.find((point) => point.id !== p.id)!;

            points.forEach((point) => {
                if (point.id === p.id) {
                    return;
                }

                if (GiftWrapping.pointOnRightSide(p, q, point)) {
                    q = point;
                }
            });

            p = q;
            convexHull.push(p.x, p.y);
        } while (p.id !== pivot.id);

        return convexHull;
    }
}
