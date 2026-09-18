import { useState, type ReactNode } from "react";
import { ConvexHullCanvas } from "./ConvexHullCanvas";
import { ConvexHullOperators } from "./ConvexHullOperators";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import type { Point } from "../common/Point";
import { GiftWrapping } from "./GiftWrapping";

type ConvexHullManagerProps = {
    canvasSize: {
        width: number;
        height: number;
    };
};

type ConvexHullManagerResult = {
    operators: ReactNode;
    canvas: ReactNode;
};

export type ConvexHullPoint = Point & { convex: boolean };

export function useConvexHullManager(
    props: ConvexHullManagerProps,
): ConvexHullManagerResult {
    // Options.
    const [options, setOptions] = useState<ConvexHullOptions>({
        draggableMode: true,
        addableMode: false,
        deletableMode: false,
    });

    // Points.
    const [points, setPoints] = useState<ConvexHullPoint[]>([
        { id: crypto.randomUUID(), x: 50, y: 50, convex: false },
    ]);

    // Convex hull.
    const lines = GiftWrapping.computeLinesInConvexHull(points);

    // Handler to add point.
    const addPoint = (x: number, y: number) => {
        setPoints((currentPoints) => [
            ...currentPoints,
            {
                id: crypto.randomUUID(),
                x,
                y,
                convex: false,
            },
        ]);
    };

    // Handler to delete point.
    const deletePoint = (id: string) => {
        setPoints((currentPoints) =>
            currentPoints.filter((point) => point.id !== id),
        );
    };

    // Handler to move point.
    const movePoint = (id: string, x: number, y: number) => {
        setPoints((currentPoints) =>
            currentPoints.map((point) =>
                point.id === id ? { ...point, x, y } : point,
            ),
        );
    };

    return {
        operators: (
            <ConvexHullOperators
                options={options}
                onOptionsChange={setOptions}
            />
        ),
        canvas: (
            <ConvexHullCanvas
                canvasSize={props.canvasSize}
                options={options}
                points={points}
                onAddPoint={addPoint}
                onDeletePoint={deletePoint}
                onMovePoint={movePoint}
            />
        ),
    };
}
