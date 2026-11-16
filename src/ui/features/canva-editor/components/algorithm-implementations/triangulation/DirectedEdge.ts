import type { Point } from "../math/Point";
import type { Triangle } from "./Triangle";

export class DirectedEdge {
    private a: Point;
    private b: Point;
    private twin: DirectedEdge | null = null;
    private next: DirectedEdge | null = null;
    private triangle: Triangle | null = null;

    public constructor(a: Point, b: Point) {
        this.a = a;
        this.b = b;
    }

    public getPoints() {
        return { a: this.a, b: this.b };
    }

    public getNext() {
        return this.next;
    }

    public setNext(next: DirectedEdge) {
        this.next = next;
    }

    public getTwin() {
        return this.twin;
    }

    public setTwin(twin: DirectedEdge) {
        this.twin = twin;
    }

    public setTriangle(triangle: Triangle) {
        this.triangle = triangle;
    }

    public getTriangle() {
        return this.triangle;
    }
}
