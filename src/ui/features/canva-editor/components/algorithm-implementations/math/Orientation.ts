import type { Point } from "./Point";

/**
 * This function checks which direction you have to turn if you were walking from point `p` to point `q`, and then to point `r`.
 */
export function orientation(p: Point, q: Point, r: Point) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) {
        return "collinear";
    }
    return val > 0 ? "right" : "left";
}
