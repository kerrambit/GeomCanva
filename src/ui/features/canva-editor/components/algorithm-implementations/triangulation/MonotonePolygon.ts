import type { Result } from "../../../../../../types/Result";
import type { Point } from "../common/Point";

export class MonotonePolygon {
    private leftPath: Point[];
    private rightPath: Point[];

    private constructor(l: Point[], p: Point[]) {
        this.leftPath = [...l];
        this.rightPath = [...p];
    }

    public nextInLeftPath() {
        return this.leftPath.shift();
    }

    public nextInRightPath() {
        return this.rightPath.shift();
    }

    public isLeftPathEmpty() {
        return this.leftPath.length === 0;
    }

    public isRightPathEmpty() {
        return this.rightPath.length === 0;
    }

    /**
     * Creates MonotonePolygon object if the points form a y-monotone polygon.
     *
     * @param points array of points in the order how they were inserted, the coordinates system has (0,0) at top left corner
     * @returns monotone polygon or error if points do not form a valid monotone polygon
     */
    public static create(points: Point[]): Result<MonotonePolygon> {
        const n = points.length;

        // Base case.
        if (n < 3) {
            return {
                success: false,
                error: new Error(
                    `Not valid polygon! Expected at least three points, received ${points.length} points.`,
                ),
            };
        }

        // Find the top extreme (minimum y in canvas coordinates).
        const topIdx = points.reduce((highestIdx, point, index) => {
            const highest = points[highestIdx];
            if (point.y < highest.y || (point.y === highest.y && point.x < highest.x)) {
                return index;
            }
            return highestIdx;
        }, 0);

        // Find the bottom extreme (maximum y in canvas coordinates).
        const bottomIdx = points.reduce((lowestIdx, point, index) => {
            const lowest = points[lowestIdx];
            if (point.y > lowest.y || (point.y === lowest.y && point.x < lowest.x)) {
                return index;
            }
            return lowestIdx;
        }, 0);

        // Start both paths from the top extreme.
        const lpq: Point[] = [points[topIdx]];
        const rpq: Point[] = [points[topIdx]];

        // Walk forward to form the left path (from top to bottom).
        let i = topIdx;
        while (i !== bottomIdx) {
            const nextIdx = (i + 1) % n;

            if (
                !(
                    points[nextIdx].y > points[i].y ||
                    (points[i].y === points[nextIdx].y && points[i].x < points[nextIdx].x)
                )
            ) {
                return {
                    success: false,
                    error: new Error(`Polygon is not y-monotone! Failed on left path.`),
                };
            }

            lpq.push(points[nextIdx]);
            i = nextIdx;
        }

        // Walk backward to form the right path (from top to bottom).
        let j = topIdx;
        while (j !== bottomIdx) {
            const prevIdx = (j - 1 + n) % n;

            if (
                !(
                    points[prevIdx].y > points[j].y ||
                    (points[j].y === points[prevIdx].y && points[j].x < points[prevIdx].x)
                )
            ) {
                return {
                    success: false,
                    error: new Error(`Polygon is not y-monotone! Failed on right path.`),
                };
            }

            rpq.push(points[prevIdx]);
            j = prevIdx;
        }

        return {
            success: true,
            value: new MonotonePolygon(lpq, rpq),
        };
    }
}
