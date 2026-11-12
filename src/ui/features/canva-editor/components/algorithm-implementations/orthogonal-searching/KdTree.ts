import type { Result } from "../../../../../../types/Result";
import type { Point } from "../math/Point";

export class KdTreeNode {
    private point: Point;
    private depth: number;
    private lesser: KdTreeNode | null = null;
    private greater: KdTreeNode | null = null;
    private parent: KdTreeNode | null = null;

    public constructor(point: Point, depth: number) {
        this.point = point;
        this.depth = depth;
    }

    public getPoint() {
        return this.point;
    }

    public getDepth() {
        return this.depth;
    }

    public setLesser(lesser: KdTreeNode) {
        this.lesser = lesser;
    }

    public getLesser() {
        return this.lesser;
    }

    public setGreater(greater: KdTreeNode) {
        this.greater = greater;
    }

    public getGreater() {
        return this.greater;
    }

    public setParent(parent: KdTreeNode) {
        this.parent = parent;
    }

    public getParent() {
        return this.parent;
    }
}

export type KdTreeAxis = "x" | "y";

export type KdTreeDividingLinesBoundaries = {
    x: { min: number; max: number };
    y: { min: number; max: number };
};

export type KdTreeDividingLine = {
    axis: KdTreeAxis;
    depth: number;
    points: [number, number, number, number];
};

export class KdTree {
    private root: KdTreeNode;

    private constructor(root: KdTreeNode) {
        this.root = root;
    }

    public getRoot() {
        return this.root;
    }

    public getHeight() {
        return KdTree._getHeight(this.root);
    }

    private static _getHeight(node: KdTreeNode | null): number {
        if (!node) {
            return 0;
        }

        return (
            1 +
            Math.max(
                KdTree._getHeight(node.getLesser()),
                KdTree._getHeight(node.getGreater()),
            )
        );
    }

    public getDividingLines(
        dividingLines: KdTreeDividingLine[],
        boundaries: KdTreeDividingLinesBoundaries,
    ) {
        KdTree._getDividingLines(this.root, boundaries, dividingLines);
    }

    private static _getDividingLines(
        node: KdTreeNode | null,
        boundaries: {
            x: { min: number; max: number };
            y: { min: number; max: number };
        },
        result: KdTreeDividingLine[],
    ) {
        if (!node) {
            return;
        }

        if (!node.getLesser() && !node.getGreater()) {
            return;
        }

        const point = node.getPoint();
        const depth = node.getDepth();
        const axis = KdTree.getAxisByDepth(depth);

        if (axis === "x") {
            result.push({
                axis,
                depth,
                points: [point.x, boundaries.y.min, point.x, boundaries.y.max],
            });

            KdTree._getDividingLines(
                node.getLesser(),
                { x: { min: boundaries.x.min, max: point.x }, y: boundaries.y },
                result,
            );
            KdTree._getDividingLines(
                node.getGreater(),
                { x: { min: point.x, max: boundaries.x.max }, y: boundaries.y },
                result,
            );
        } else {
            result.push({
                axis,
                depth,
                points: [boundaries.x.min, point.y, boundaries.x.max, point.y],
            });

            KdTree._getDividingLines(
                node.getLesser(),
                { x: boundaries.x, y: { min: boundaries.y.min, max: point.y } },
                result,
            );
            KdTree._getDividingLines(
                node.getGreater(),
                { x: boundaries.x, y: { min: point.y, max: boundaries.y.max } },
                result,
            );
        }
    }

    public static create(points: Point[]): Result<KdTree> {
        const result = KdTree._create(points, 0);
        if (result) {
            return {
                success: true,
                value: new KdTree(result),
            };
        }

        return {
            success: false,
            error: new Error("No points were found!"),
        };
    }

    private static _create(points: Point[], depth: number): KdTreeNode | null {
        if (points.length === 0) {
            return null;
        }

        // A single point is a leaf - it stores the point but draws no line.
        if (points.length === 1) {
            return new KdTreeNode(points[0], depth);
        }

        const axis = KdTree.getAxisByDepth(depth);
        const sorted = [...points].sort((a, b) => a[axis] - b[axis]);
        const medianIndex =
            axis === "x"
                ? Math.floor((sorted.length - 1) / 2)
                : Math.floor((sorted.length - 1) / 2);
        const splitIndex = axis === "x" ? medianIndex + 1 : medianIndex;

        const node = new KdTreeNode(sorted[medianIndex], depth);

        const lesser = KdTree._create(sorted.slice(0, splitIndex), depth + 1);
        if (lesser) {
            node.setLesser(lesser);
            lesser.setParent(node);
        }

        const greater = KdTree._create(sorted.slice(splitIndex + 1), depth + 1);
        if (greater) {
            node.setGreater(greater);
            greater.setParent(node);
        }

        return node;
    }

    public static getAxisByDepth(depth: number): KdTreeAxis {
        return depth % 2 === 0 ? "x" : "y";
    }
}
