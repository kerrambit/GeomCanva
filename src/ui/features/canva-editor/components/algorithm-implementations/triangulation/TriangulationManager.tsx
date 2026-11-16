import { useEffect, useState } from "react";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import type { TriangulationOptions } from "./TriangulationOptions";
import { TriangulationOperators } from "./TriangulationOperators";
import { SweepingLineTriangulation } from "./SweepingLineTriangulation";
import { SweepingLineTriangulationCanvas } from "./SweepingLineTriangulationCanvas";
import { InfoMessage } from "../../../../../components/common/messages/InfoMessage";
import { Group } from "@mantine/core";
import { MonotonePolygon } from "./MonotonePolygon";
import { WarningMessage } from "../../../../../components/common/messages/WarningMessage";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { IconTestPipe } from "@tabler/icons-react";
import type { Point } from "../math/Point";
import { DelaunayTriangulationCanvas } from "./DelaunayTriangulationCanvas";
import { DelaunayTriangulation } from "./DelaunayTriangulation";

const EXAMPLE = [
    { x: 532, y: 59 },
    { x: 257, y: 270 },
    { x: 210, y: 674 },
    { x: 530, y: 850 },
    { x: 1070, y: 590 },
    { x: 920, y: 541 },
    { x: 847, y: 415 },
    { x: 868, y: 317 },
    { x: 660, y: 303 },
    { x: 612, y: 193 },
    { x: 649, y: 99 },
];

type TriangulationManagerProps = {
    canvasSize: {
        width: number;
        height: number;
    };
};

type TriangulationAlgorithm = "Delaunay" | "SweepingLine";

export function useTriangulationManager(
    props: TriangulationManagerProps,
): AlgorithmManagerResult {
    // Active and visible options.
    const [options, setOptions] = useState<TriangulationOptions>({
        draggableMode: false,
        addableMode: true,
        deletableMode: false,
    });
    const [optionsVisibility, setOptionsVisibility] = useState<TriangulationOptions>({
        draggableMode: true,
        addableMode: true,
        deletableMode: true,
    });

    // Type of triangulation algorithm.
    const [tab, setTab] = useState<TriangulationAlgorithm>("Delaunay");

    // Is polygon enclosed (for sweeping line algorithm).
    const [isClosed, setIsClosed] = useState(false);

    // Points.
    const [points, setPoints] = useState<Point[]>([]);

    // Set of triangulation lines.
    let flatTriangulationSet: number[] = [];

    // Errors and warnings.
    const warnings: string[] = [];

    // Compute triangulation based on the algorithm.
    switch (tab) {
        case "Delaunay":
            if (points && points.length > 1) {
                // Key ignores direction.
                const lines = new Map<string, [number, number, number, number]>();

                const keyOf = (a: Point, b: Point) => {
                    const aFirst = a.x < b.x || (a.x === b.x && a.y <= b.y);
                    const [p, q] = aFirst ? [a, b] : [b, a];
                    return `${p.x},${p.y}|${q.x},${q.y}`;
                };

                const result = DelaunayTriangulation.create(
                    points,
                    undefined,
                    (a: Point, b: Point) => {
                        const key = keyOf(a, b);
                        if (!lines.has(key)) {
                            lines.set(key, [a.x, a.y, b.x, b.y]);
                        }
                    },
                );

                if (!result.success) {
                    warnings.push(result.error.message);
                } else {
                    flatTriangulationSet = Array.from(lines.values()).flat();
                }
            }
            break;
        case "SweepingLine":
            if (points && points.length > 2) {
                const result = MonotonePolygon.create(points);
                if (!result.success) {
                    warnings.push(result.error.message);
                } else if (isClosed) {
                    flatTriangulationSet =
                        SweepingLineTriangulation.triangulateMonotonePolygon(
                            result.value,
                        );
                }
            }
            break;
        default:
            break;
    }

    // Handler to add point.
    const addPoint = (x: number, y: number) => {
        setPoints((currentPoints) => [
            ...currentPoints,
            { id: crypto.randomUUID(), x, y },
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
        setIsClosed(false);
        setPoints([]);
        setOptionsVisibility({
            draggableMode: true,
            addableMode: true,
            deletableMode: true,
        });
    };

    // Handle enclosed polygon (for sweeping line algorithm).
    const handleEnclosedPolygon = () => {
        setIsClosed(true);
        setOptionsVisibility({
            draggableMode: true,
            addableMode: false,
            deletableMode: true,
        });
        setOptions({
            draggableMode: true,
            addableMode: false,
            deletableMode: false,
        });
    };

    // Handle reopened polygon (for sweeping line algorithm).
    const handleReopenedPolygon = () => {
        setOptionsVisibility({
            draggableMode: true,
            addableMode: true,
            deletableMode: true,
        });
        setIsClosed(false);
    };

    // Show example.
    const showExample = () => {
        switch (tab) {
            case "Delaunay":
                setPoints(EXAMPLE.map((p) => ({ id: crypto.randomUUID(), ...p })));
                break;
            case "SweepingLine":
                setPoints(EXAMPLE.map((p) => ({ id: crypto.randomUUID(), ...p })));
                setIsClosed(true);
                setOptionsVisibility({
                    draggableMode: true,
                    addableMode: false,
                    deletableMode: true,
                });
                setOptions({
                    draggableMode: true,
                    addableMode: false,
                    deletableMode: false,
                });
                break;
            default:
                break;
        }
    };

    // React to changes of tab. When the tab is changed, clear the canvas and options completelly.
    useEffect(() => {
        setIsClosed(false);
        setOptionsVisibility({
            draggableMode: true,
            addableMode: true,
            deletableMode: true,
        });
        setOptions({
            draggableMode: false,
            addableMode: true,
            deletableMode: false,
        });

        if (tab === "SweepingLine") {
            setPoints([]);
        }
    }, [tab]);

    // Choose canvas based on the algorithm.
    const canvas = (() => {
        switch (tab) {
            case "Delaunay":
                return (
                    <DelaunayTriangulationCanvas
                        canvasSize={props.canvasSize}
                        options={options}
                        points={points}
                        flatTriangulationSet={flatTriangulationSet}
                        onAddPoint={addPoint}
                        onDeletePoint={deletePoint}
                        onMovePoint={movePoint}
                    />
                );
            case "SweepingLine":
                return (
                    <SweepingLineTriangulationCanvas
                        canvasSize={props.canvasSize}
                        options={options}
                        points={points}
                        flatTriangulationSet={flatTriangulationSet}
                        isClosed={isClosed}
                        onAddPoint={addPoint}
                        onDeletePoint={deletePoint}
                        onMovePoint={movePoint}
                        onPolygonEnclosed={handleEnclosedPolygon}
                        onPolygonReopened={handleReopenedPolygon}
                    />
                );
        }
    })();

    return {
        operators: (
            <TriangulationOperators
                options={options}
                optionsVisibility={optionsVisibility}
                onOptionsChange={setOptions}
                onClear={clearCanvas}
                topChildren={
                    <Group>
                        <SegmentedController<TriangulationAlgorithm>
                            value={tab}
                            onChange={setTab}
                            data={[
                                {
                                    label: "Delaunay",
                                    value: "Delaunay",
                                },
                                {
                                    label: "Using sweeping line",
                                    value: "SweepingLine",
                                },
                            ]}
                            widthWrapOrientationLimit={292}
                        />

                        {tab === "SweepingLine" && !isClosed && (
                            <InfoMessage
                                iconSize={50}
                                text="Place points to draw a polygon. Click the starting point to close the shape."
                            ></InfoMessage>
                        )}
                        {warnings.map((warning, index) => {
                            return (
                                <WarningMessage
                                    iconSize={25}
                                    key={index}
                                    text={warning}
                                ></WarningMessage>
                            );
                        })}
                    </Group>
                }
                bottomChildren={
                    <ActionableTile onClick={showExample} tooltip="Show example.">
                        <IconTestPipe onClick={() => {}}></IconTestPipe>
                    </ActionableTile>
                }
            />
        ),
        canvas,
    };
}
