import { orientation } from "./Orientation";
import type { Point } from "./Point";

export function doesTwoLineSegmentsIntersect(
    p1: Point,
    q1: Point,
    p2: Point,
    q2: Point,
): boolean {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) {
        return true;
    }
    return false;
}
