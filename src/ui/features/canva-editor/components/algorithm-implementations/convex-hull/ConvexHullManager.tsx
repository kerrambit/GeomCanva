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
    const [points, setPoints] = useState<Point[]>([]);

    // Convex hull.
    const flatConvexHull = GiftWrapping.computePointsInConvexHull(points);

    // Handler to add point.
    const addPoint = (x: number, y: number) => {
        setPoints((currentPoints) => [
            ...currentPoints,
            {
                id: crypto.randomUUID(),
                x,
                y,
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

    // Handler to clear canvas.
    const clearCanvas = () => {
        setPoints([]);
    };

    // Handler to generate random points.
    const generateRandomPoints = () => {
        clearCanvas();

        const padding = 20;
        setPoints(
            Array.from({ length: 30 }).map(() => ({
                id: crypto.randomUUID(),
                x:
                    padding +
                    Math.random() * (props.canvasSize.width - padding * 2),
                y:
                    padding +
                    Math.random() * (props.canvasSize.height - padding * 2),
            })),
        );
    };

    return {
        operators: (
            <ConvexHullOperators
                options={options}
                onOptionsChange={setOptions}
                onClear={clearCanvas}
                onGenerateRandomPoints={generateRandomPoints}
            />
        ),
        canvas: (
            <ConvexHullCanvas
                canvasSize={props.canvasSize}
                options={options}
                points={points}
                flatConvexHull={flatConvexHull}
                onAddPoint={addPoint}
                onDeletePoint={deletePoint}
                onMovePoint={movePoint}
            />
        ),
    };
}
