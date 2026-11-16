import type { Result } from "../../../../../../types/Result";
import { computeEuclidianDistance } from "../math/computeEuclidianDistance";
import { getRandomInteger } from "../math/getRandomInteger";
import { inCircle } from "../math/isCircle";
import { orientation } from "../math/Orientation";
import type { Point } from "../math/Point";
import { DirectedEdge } from "./DirectedEdge";
import { Triangle } from "./Triangle";

export class DelaunayTriangulation {
    private directedEdges: Set<DirectedEdge>;
    private triangles: Set<Triangle>;

    private constructor(directedEdges: Set<DirectedEdge>, triangles: Set<Triangle>) {
        this.directedEdges = directedEdges;
        this.triangles = triangles;
    }

    public getDirectedEdges() {
        return this.directedEdges;
    }

    public getTriangles() {
        return this.triangles;
    }

    public static create(
        points: readonly Point[],
        initialPoint?: Point,
        edgeCreationListener?: (a: Point, b: Point) => void,
    ): Result<DelaunayTriangulation> {
        // Base case.
        if (points.length === 0) {
            return {
                success: false,
                error: new Error("No points were found!"),
            };
        }

        // Data structures.
        const activeEdges: Set<DirectedEdge> = new Set();
        const finishedEdges: Set<DirectedEdge> = new Set();
        const triangles: Set<Triangle> = new Set();

        // Initial point.
        let _initialPoint: Point;
        if (!initialPoint) {
            _initialPoint = points[getRandomInteger(0, points.length - 1)];
        } else {
            _initialPoint = initialPoint;
        }

        // Search for Euclidian nearest point to `_initialPoint`.
        let nearest: Point | undefined;
        let nearestDist = Infinity;
        for (const p of points) {
            if (p === _initialPoint) continue;
            const d = computeEuclidianDistance(_initialPoint, p);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = p;
            }
        }
        if (!nearest) {
            return { success: false, error: new Error("Need at least 2 points!") };
        }

        // Create first active pair.
        DelaunayTriangulation.createPair(_initialPoint, nearest, activeEdges);
        edgeCreationListener?.(_initialPoint, nearest);

        // Main loop.
        while (activeEdges.size > 0) {
            const e = DelaunayTriangulation.popFromSet(activeEdges)!;
            finishedEdges.add(e);

            const a = e.getPoints().a;
            const b = e.getPoints().b;

            // Get optimal point based on Delaunay distance (`inCircle` function => if `point` lies inside, of course its distance is smaller than of current `best`).
            let best: Point | undefined = undefined;

            for (const point of points) {
                if (orientation(a, b, point) !== "left") continue;

                if (best === undefined) {
                    best = point;
                    continue;
                }

                const result = inCircle(a, b, best, point);
                if (result.success && result.value === "inside") {
                    best = point;
                }
            }

            if (best === undefined) {
                continue;
            }

            // Create new edges.
            const dBBest = DelaunayTriangulation.getOrCreate(
                b,
                best,
                activeEdges,
                edgeCreationListener,
            );
            const dBestA = DelaunayTriangulation.getOrCreate(
                best,
                a,
                activeEdges,
                edgeCreationListener,
            );
            e.setNext(dBBest);
            dBBest.setNext(dBestA);
            dBestA.setNext(e);

            // Create CCW triangle.
            const triangle = new Triangle(e, dBBest, dBestA);
            triangles.add(triangle);
            e.setTriangle(triangle);
            dBBest.setTriangle(triangle);
            dBestA.setTriangle(triangle);

            // Edges in tringle are marked as finished.
            finishedEdges.add(dBBest);
            finishedEdges.add(dBestA);
        }

        return {
            success: true,
            value: new DelaunayTriangulation(finishedEdges, triangles),
        };
    }

    private static getOrCreate(
        u: Point,
        v: Point,
        activeEdges: Set<DirectedEdge>,
        edgeCreationListener?: (a: Point, b: Point) => void,
    ) {
        const existing = DelaunayTriangulation.findActive(activeEdges, u, v);
        if (existing) {
            activeEdges.delete(existing);
            return existing;
        }

        const [uv, vu] = DelaunayTriangulation.createPair(u, v);
        activeEdges.add(vu);
        edgeCreationListener?.(u, v);
        return uv;
    }

    private static createPair(a: Point, b: Point, activeEdges?: Set<DirectedEdge>) {
        const da = new DirectedEdge(a, b);
        const db = new DirectedEdge(b, a);

        da.setTwin(db);
        db.setTwin(da);

        activeEdges?.add(da);
        activeEdges?.add(db);

        return [da, db];
    }

    private static popFromSet<T>(set: Set<T>) {
        if (set.size === 0) return undefined;
        const first = set.values().next().value;
        if (!first) {
            return undefined;
        }
        set.delete(first);
        return first;
    }

    private static findActive(active: Set<DirectedEdge>, u: Point, v: Point) {
        for (const edge of active) {
            const { a, b } = edge.getPoints();
            if (a === u && b === v) return edge;
        }
        return undefined;
    }
}
