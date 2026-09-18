import { useState, type ReactNode } from "react";
import { ConvexHullCanvas } from "./ConvexHullCanvas";
import { ConvexHullOperators } from "./ConvexHullOperators";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import type { Point } from "../common/Point";

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
    const [points, setPoints] = useState<Point[]>([{ id: 1, x: 50, y: 50 }]);

    // Handler to add point.
    const addPoint = (x: number, y: number) => {
        setPoints((currentPoints) => [
            ...currentPoints,
            {
                id: Math.max(0, ...currentPoints.map((point) => point.id)) + 1,
                x,
                y,
            },
        ]);
    };

    // Handler to delete point.
    const deletePoint = (id: number) => {
        setPoints((currentPoints) =>
            currentPoints.filter((point) => point.id !== id),
        );
    };

    // Handler to move point.
    const movePoint = (id: number, x: number, y: number) => {
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
