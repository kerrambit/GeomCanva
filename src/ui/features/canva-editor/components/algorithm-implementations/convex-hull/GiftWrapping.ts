import { type Point } from "../common/Point";
import type { ConvexHullPoint } from "./ConvexHullManager";

export class GiftWrapping {
    private static pointOnRightSide(x: Point, y: Point, z: Point) {
        const determinant =
            (y.x - x.x) * (z.y - x.y) - (y.y - x.y) * (z.x - x.x);
        return determinant > 0;
    }

    public static computeLinesInConvexHull(points: ConvexHullPoint[]) {
        points.forEach((point) => {
            point.convex = false;
        });

        // Elementary conditions.
        if (points.length === 0) {
            return;
        } else if (points.length < 4) {
            points.forEach((point) => {
                point.convex = true;
            });
            return;
        }

        // Find the extreme (y-min).
        const pivot = points.reduce((lowest, point) => {
            if (
                point.y < lowest.y ||
                (point.y === lowest.y && point.x < lowest.x)
            ) {
                return point;
            }

            return lowest;
        });

        // Push pivot into convex hull.
        pivot.convex = true;

        // Current point in convex hull.
        let p = pivot;
        // Best candidate for convex hull.
        let q: ConvexHullPoint;

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
            p.convex = true;
        } while (p.id !== pivot.id);
    }
}
