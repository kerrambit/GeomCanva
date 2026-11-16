import { useState } from "react";
import { ConvexHullCanvas } from "./ConvexHullCanvas";
import { GiftWrapping } from "./GiftWrapping";
import { GrahamScan } from "./GrahamScan";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import { CommonOperators } from "../common/CommonOperators";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import type { Point } from "../math/Point";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { IconPyramid } from "@tabler/icons-react";
import { DelaunayTriangulation } from "../triangulation/DelaunayTriangulation";

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

    // Flat map for triangulation.
    const [flatTriangulationSet, setFlatTriangulationSet] = useState<number[]>([]);

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
        setFlatTriangulationSet([]);
    };

    // Handler to delete point.
    const deletePoint = (id: string) => {
        setPoints((currentPoints) => currentPoints.filter((point) => point.id !== id));
        setFlatTriangulationSet([]);
    };

    // Handler to move point.
    const movePoint = (id: string, x: number, y: number) => {
        setPoints((currentPoints) =>
            currentPoints.map((point) => (point.id === id ? { ...point, x, y } : point)),
        );
        setFlatTriangulationSet([]);
    };

    // Handler to clear canvas.
    const clearCanvas = () => {
        setPoints([]);
        setFlatTriangulationSet([]);
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
        setFlatTriangulationSet([]);
    };

    // Handler for triangulation.
    const triangulate = () => {
        if (points && points.length > 1) {
            // Key ignores direction.
            const lines = new Map<string, [number, number, number, number]>();

            const keyOf = (a: Point, b: Point) => {
                const aFirst = a.x < b.x || (a.x === b.x && a.y <= b.y);
                const [p, q] = aFirst ? [a, b] : [b, a];
                return `${p.x},${p.y}|${q.x},${q.y}`;
            };

            DelaunayTriangulation.create(points, undefined, (a: Point, b: Point) => {
                const key = keyOf(a, b);
                if (!lines.has(key)) {
                    lines.set(key, [a.x, a.y, b.x, b.y]);
                }
            });

            setFlatTriangulationSet(Array.from(lines.values()).flat());
        }
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
                bottomChildren={
                    <ActionableTile onClick={triangulate} tooltip="Triangulate.">
                        <IconPyramid onClick={() => {}}></IconPyramid>
                    </ActionableTile>
                }
            />
        ),
        canvas: (
            <ConvexHullCanvas
                canvasSize={props.canvasSize}
                options={options}
                points={points}
                flatConvexHull={flatConvexHull}
                flatTriangulationSet={flatTriangulationSet}
                onAddPoint={addPoint}
                onDeletePoint={deletePoint}
                onMovePoint={movePoint}
            />
        ),
    };
}
