import type { Point } from "../math/Point";
import { DirectedEdge } from "./DirectedEdge";

export class Triangle {
    private vertices: {
        a: Point;
        b: Point;
        c: Point;
    };

    private edges: {
        ab: DirectedEdge;
        bc: DirectedEdge;
        ca: DirectedEdge;
    };

    public constructor(ab: DirectedEdge, bc: DirectedEdge, ca: DirectedEdge) {
        this.vertices = {
            a: ab.getPoints().a,
            b: bc.getPoints().a,
            c: ca.getPoints().a,
        };
        this.edges = {
            ab: ab,
            bc: bc,
            ca: ca,
        };
    }

    public getVertices() {
        return this.vertices;
    }

    public getEdges() {
        return this.edges;
    }
}
