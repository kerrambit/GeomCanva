import type { Point } from "./Point";
import { orientation } from "./Orientation";
import type { Result } from "../../../../../../types/Result";

export type CircleSide = "inside" | "on" | "outside";

/**
 * Tells whether point `d` lies inside, on, or outside the circle
 * passing through `a`, `b` and `c`. The triangle may be given in
 * either winding order.
 */
export function inCircle(a: Point, b: Point, c: Point, d: Point): Result<CircleSide> {
    const turn = orientation(a, b, c);
    if (turn === "collinear") {
        return {
            success: false,
            error: new Error("No circumcircle exists, as 'a', 'b', 'c' are collinear!"),
        };
    }

    const adx = a.x - d.x,
        ady = a.y - d.y;
    const bdx = b.x - d.x,
        bdy = b.y - d.y;
    const cdx = c.x - d.x,
        cdy = c.y - d.y;

    const alift = adx * adx + ady * ady;
    const blift = bdx * bdx + bdy * bdy;
    const clift = cdx * cdx + cdy * cdy;

    const det =
        adx * (bdy * clift - cdy * blift) -
        ady * (bdx * clift - cdx * blift) +
        alift * (bdx * cdy - cdx * bdy);

    const signed = turn === "left" ? det : -det;

    if (signed === 0) return { success: true, value: "on" };
    return signed > 0
        ? { success: true, value: "inside" }
        : { success: true, value: "outside" };
}
