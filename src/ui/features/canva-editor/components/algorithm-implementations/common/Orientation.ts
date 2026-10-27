import type { Point } from "./Point";

export function orientation(p: Point, q: Point, r: Point) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) {
        return "collinear";
    }
    return val > 0 ? "clockwise" : "counterclockwise";
}
