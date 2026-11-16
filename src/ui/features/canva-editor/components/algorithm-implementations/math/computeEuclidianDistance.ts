import type { Point } from "./Point";

export function computeEuclidianDistance(a: Point, b: Point) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}
