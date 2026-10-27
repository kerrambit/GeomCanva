export type Point = {
    id: string;
    x: number;
    y: number;
};

export function createPoint(x: number, y: number) {
    return {
        id: crypto.randomUUID(),
        x: x,
        y: y,
    };
}

export function flatPointsArray(points: Point[]) {
    return points.flatMap((point) => [point.x, point.y]);
}
