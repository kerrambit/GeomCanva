import { type Point } from "../common/Point";

export class GrahamScan {
    /**
     * Computes determinant of two vectors given by points `x`, `y` and `z`.
     */
    private static determinant(x: Point, y: Point, z: Point) {
        const determinant =
            (y.x - x.x) * (z.y - x.y) - (y.y - x.y) * (z.x - x.x);
        return determinant;
    }

    /**
     * Returns flat array of points forming convex hull for `points`.
     */
    public static computePointsInGrahamScan(points: Point[]) {
        // Elementary conditions.
        if (points.length === 0) {
            return [];
        } else if (points.length < 3) {
            return points.flatMap((point) => [point.x, point.y]);
        }

        // Find the extreme (y-min). For UI, this is the top-most point.
        const pivot = points.reduce((lowest, point) => {
            if (
                point.y < lowest.y ||
                (point.y === lowest.y && point.x < lowest.x)
            ) {
                return point;
            }
            return lowest;
        });

        // Sort points counter-clockwise around the pivot.
        const sortedPoints = [...points].sort((a: Point, b: Point) => {
            if (a == pivot) {
                return -1;
            }
            if (b == pivot) {
                return 1;
            }

            const determinant = this.determinant(pivot, a, b);

            // Point 'b' is visually to the left.
            if (determinant < 0) {
                return -1;
            }
            // Point 'b' lies on the line. Choose the closest.
            else if (determinant == 0) {
                const distA = (a.x - pivot.x) ** 2 + (a.y - pivot.y) ** 2;
                const distB = (b.x - pivot.x) ** 2 + (b.y - pivot.y) ** 2;
                return distA < distB ? -1 : 1;
            }
            // Point 'b' is visually to the right.
            else {
                return 1;
            }
        });

        // Initialize indices stack with the first two points.
        const stack = [0, 1];

        // Iterate through remaining points in sorted array just once.
        for (let i = 2; i < sortedPoints.length; ++i) {
            // While the turn is clockwise or collinear (>= 0 in UI space), pop the last index.
            while (
                stack.length >= 2 &&
                this.determinant(
                    sortedPoints[stack[stack.length - 2]],
                    sortedPoints[stack[stack.length - 1]],
                    sortedPoints[i],
                ) >= 0
            ) {
                stack.pop();
            }
            // Push the valid counter-clockwise turn.
            stack.push(i);
        }

        // Close the polygon loop.
        if (stack.length > 2) {
            stack.push(stack[0]);
        }

        // Flat map of convex hull.
        return stack.flatMap((index) => [
            sortedPoints[index].x,
            sortedPoints[index].y,
        ]);
    }
}
