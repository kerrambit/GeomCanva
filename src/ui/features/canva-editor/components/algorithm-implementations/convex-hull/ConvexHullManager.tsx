import { useState } from "react";
import { ConvexHullCanvas } from "./ConvexHullCanvas";
import type { Point } from "../common/Point";
import { GiftWrapping } from "./GiftWrapping";
import { GrahamScan } from "./GrahamScan";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import { CommonOperators } from "../common/CommonOperators";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";

type ConvexHullManagerProps = {
    canvasSize: {
        width: number;
        height: number;
    };
};

type ConvexHullAlgorithm = "GiftWrapping" | "GrahamScan";

export function useConvexHullManager(
    props: ConvexHullManagerProps,
): AlgorithmManagerResult {
    // Options.
    const [options, setOptions] = useState<ConvexHullOptions>({
        draggableMode: false,
        addableMode: true,
        deletableMode: false,
    });

    // Type of convex hull algorithm.
    const [tab, setTab] = useState<ConvexHullAlgorithm>("GiftWrapping");

    // Points.
    const [points, setPoints] = useState<Point[]>([]);

    // Convex hull.
    let flatConvexHull;
    switch (tab) {
        case "GiftWrapping":
            flatConvexHull = GiftWrapping.computePointsInConvexHull(points);
            break;
        case "GrahamScan":
            flatConvexHull = GrahamScan.computePointsInGrahamScan(points);
            break;
        default:
            flatConvexHull = GiftWrapping.computePointsInConvexHull(points);
            break;
    }

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
        setPoints((currentPoints) => currentPoints.filter((point) => point.id !== id));
    };

    // Handler to move point.
    const movePoint = (id: string, x: number, y: number) => {
        setPoints((currentPoints) =>
            currentPoints.map((point) => (point.id === id ? { ...point, x, y } : point)),
        );
    };

    // Handler to clear canvas.
    const clearCanvas = () => {
        setPoints([]);
    };

    // Handler to generate random points.
    const generateRandomPoints = () => {
        const padding = 20;
        setPoints((prev) => [
            ...prev,
            ...Array.from({ length: 30 }).map(() => ({
                id: crypto.randomUUID(),
                x: padding + Math.random() * (props.canvasSize.width - padding * 2),
                y: padding + Math.random() * (props.canvasSize.height - padding * 2),
            })),
        ]);
    };

    return {
        operators: (
            <CommonOperators
                options={options}
                onOptionsChange={setOptions}
                onClear={clearCanvas}
                onGenerateRandomPoints={generateRandomPoints}
                topChildren={
                    <>
                        <SegmentedController<ConvexHullAlgorithm>
                            value={tab}
                            onChange={setTab}
                            data={[
                                {
                                    label: "Gift Wrapping",
                                    value: "GiftWrapping",
                                },
                                {
                                    label: "Graham Scan",
                                    value: "GrahamScan",
                                },
                            ]}
                            widthWrapOrientationLimit={292}
                        />
                    </>
                }
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
