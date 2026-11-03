import type { Result } from "../../../../../../types/Result";
import type { Point } from "../math/Point";

/**
 * Class representing Y-monotone polygon.
 */
export class MonotonePolygon {
    private leftPath: Point[];
    private rightPath: Point[];

    private constructor(l: Point[], p: Point[]) {
        this.leftPath = [...l];
        this.rightPath = [...p];
    }

    public next(): {
        id: string;
        x: number;
        y: number;
        path: "right" | "left";
    } {
        if (this.isLeftPathEmpty()) {
            throw new Error(`Trying to acess the non-existing element in the left path!`);
        }

        if (this.isRightPathEmpty()) {
            throw new Error(
                `Trying to acess the non-existing element in the right path!`,
            );
        }

        const l = this.leftPath[0];
        const r = this.rightPath[0];

        // Special case, both paths might share the same first and last element at the beginning.
        if (l.id === r.id) {
            this.nextInLeftPath();
            return this.nextInRightPath();
        }

        // Return elements in the lexicographic order.
        if (l.y < r.y || (l.y === r.y && l.x < r.x)) {
            return this.nextInLeftPath();
        }

        return this.nextInRightPath();
    }

    public nextInLeftPath(): {
        id: string;
        x: number;
        y: number;
        path: "left";
    } {
        const result = this.leftPath.shift();
        if (result) {
            return {
                id: result.id,
                x: result.x,
                y: result.y,
                path: "left",
            };
        }
        throw new Error(`Trying to acess the non-existing element in the left path!`);
    }

    public nextInRightPath(): {
        id: string;
        x: number;
        y: number;
        path: "right";
    } {
        const result = this.rightPath.shift();
        if (result) {
            return {
                id: result.id,
                x: result.x,
                y: result.y,
                path: "right",
            };
        }
        throw new Error(`Trying to acess the non-existing element in the right path!`);
    }

    public isLeftPathEmpty() {
        return this.leftPath.length === 0;
    }

    public isRightPathEmpty() {
        return this.rightPath.length === 0;
    }

    public getRightPathLength() {
        return this.rightPath.length;
    }

    public getLeftPathLength() {
        return this.leftPath.length;
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
            if (point.y > lowest.y || (point.y === lowest.y && point.x > lowest.x)) {
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

        // Signed area in canvas coordinates (y down): > 0 means visually clockwise.
        let area = 0;
        for (let k = 0; k < n; k++) {
            const a = points[k];
            const b = points[(k + 1) % n];
            area += a.x * b.y - b.x * a.y;
        }

        // Clockwise on screen: the forward walk is the visually the right chain.
        const [leftChain, rightChain] = area > 0 ? [rpq, lpq] : [lpq, rpq];

        return {
            success: true,
            value: new MonotonePolygon(leftChain, rightChain),
        };
    }
}
