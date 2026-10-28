import type { MonotonePolygon } from "./MonotonePolygon";
import { orientation } from "../common/Orientation";

export class SweepingLineTriangulation {
    /**
     * Computes array of lines representing triangulation diagonals.
     * @param polygon y-monotone polygon to triangulate
     * @returns flat array of numbers representing diagonals lines, not closed
     */
    public static triangulateMonotonePolygon(polygon: MonotonePolygon): number[] {
        // Final array will contain all triangulation diagonals.
        const result: number[] = [];

        // Number of unique points in the polygon.
        const n = polygon.getRightPathLength() + polygon.getLeftPathLength() - 2;

        // Initialize the stack and push v1 and v2 into it.
        const first = polygon.next();
        const second = polygon.next();
        if (!first || !second) {
            return [];
        }
        const stack = [first, second];

        // Iterate for all remaining sorted points in the polygon, except the last one.
        for (let i = 2; i < n - 1; ++i) {
            const current = polygon.next();

            // Current vertex and vertex on the top of stack are not on the same path.
            if (stack[stack.length - 1].path !== current.path) {
                const originalTop = stack[stack.length - 1]; // Remember the top of stack.

                // Pop all vertices and diagonal for each of them except the last one (bottom of stack).
                const len = stack.length;
                for (let j = 0; j < len; ++j) {
                    const element = stack.pop()!;
                    if (j < len - 1) {
                        result.push(current.x, current.y, element.x, element.y);
                    }
                }

                // Push the original top of the stack, then the current vertex.
                stack.push(originalTop);
                stack.push(current);
            }
            // Current vertex and vertex on the top of stack are on the same path.
            else {
                let lastPopped = stack.pop()!;

                // Pop the other vertices from stack as long as the diagonals are inside the polygon.
                while (stack.length > 0) {
                    const top = stack[stack.length - 1];
                    const o = orientation(current, lastPopped, top);

                    // If the turn is outside the polygon or collinear, we stop popping.
                    if (
                        (current.path === "left" && o !== "left") ||
                        (current.path === "right" && o !== "right")
                    ) {
                        break;
                    }

                    const element = stack.pop()!;
                    result.push(current.x, current.y, element.x, element.y);

                    // Update `lastPopped` so the next orientation check uses the new boundary.
                    lastPopped = element;
                }

                // Push back last valid vertex, followed by the current vertex.
                stack.push(lastPopped);
                stack.push(current);
            }
        }

        // Add diagonals from the last vertex in polygon to all stack vertices except the first and the last one.
        const last = polygon.next()!;
        let i = 1;
        while (i < stack.length - 1) {
            result.push(last.x, last.y, stack[i].x, stack[i].y);
            i++;
        }

        return result;
    }
}
