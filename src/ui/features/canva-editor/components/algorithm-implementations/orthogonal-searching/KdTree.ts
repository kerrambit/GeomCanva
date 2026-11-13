import type { Result } from "../../../../../../types/Result";
import type { Point } from "../math/Point";

/**
 * Node of the k-D tree.
 */
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

/**
 * k-D tree devides space by .
 */
export type KdTreeAxis = "x" | "y";

/**
 * Each deviding line is rendered inside bounded box, given either by viewport or if depth is greater than zero, by other dividing lines.
 */
export type KdTreeDividingLinesBoundaries = {
    x: { min: number; max: number };
    y: { min: number; max: number };
};

/**
 * k-D tree devides space by `x` and `y` axis. Type `KdTreeDividingLinesBoundaries` represents such a one line.
 * It also holds information about its depth in the tree.
 */
export type KdTreeDividingLine = {
    axis: KdTreeAxis;
    depth: number;
    points: [number, number, number, number];
};

/**
 * Encapsulates k-D tree.
 */
export class KdTree {
    private root: KdTreeNode;
    private static firstAxis: KdTreeAxis = "x";

    private constructor(root: KdTreeNode) {
        this.root = root;
    }

    public getRoot() {
        return this.root;
    }

    public static setFirstAxis(axis: KdTreeAxis) {
        KdTree.firstAxis = axis;
    }

    public static getFirstAxis(): KdTreeAxis {
        return KdTree.firstAxis;
    }

    public static getAxisByDepth(depth: number): KdTreeAxis {
        const secondAxis: KdTreeAxis = KdTree.firstAxis === "x" ? "y" : "x";
        return depth % 2 === 0 ? KdTree.firstAxis : secondAxis;
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
        // No points.
        if (points.length === 0) {
            return null;
        }

        // Leaf.
        if (points.length === 1) {
            return new KdTreeNode(points[0], depth);
        }

        // Sort points by given axis.
        const axis = KdTree.getAxisByDepth(depth);
        const sorted = [...points].sort((a, b) => a[axis] - b[axis]);

        // For `x` axis, the median stays in the lesser (left) group.
        // For `y` axis, the median stays in the lesser group, but because in our canvas, `y` points down, it should actually stay on the greater (top) group!
        const medianIndex =
            axis === "x"
                ? Math.floor((sorted.length - 1) / 2)
                : Math.floor(sorted.length / 2);
        const splitIndex = axis === "x" ? medianIndex + 1 : medianIndex;

        // Create node.
        const node = new KdTreeNode(sorted[medianIndex], depth);

        // Compute lesser group.
        const lesser = KdTree._create(sorted.slice(0, splitIndex), depth + 1);
        if (lesser) {
            node.setLesser(lesser);
            lesser.setParent(node);
        }

        // Compute greater group.
        const greater = KdTree._create(sorted.slice(splitIndex), depth + 1);
        if (greater) {
            node.setGreater(greater);
            greater.setParent(node);
        }

        return node;
    }
}
