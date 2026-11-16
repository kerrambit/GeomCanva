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
import { pushWarningNotification } from "../../../../../services/NotificationService";

const EXAMPLE_POLYGON = [
    { x: 602, y: 59 },
    { x: 327, y: 270 },
    { x: 280, y: 674 },
    { x: 600, y: 876 },
    { x: 1140, y: 590 },
    { x: 990, y: 541 },
    { x: 917, y: 415 },
    { x: 938, y: 317 },
    { x: 730, y: 303 },
    { x: 682, y: 193 },
    { x: 719, y: 99 },
];

type TriangulationManagerProps = {
    canvasSize: {
        width: number;
        height: number;
    };
};

type TriangulationAlgorithm = "SweepingLine" | "Delaunay";

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
    const [tab, setTab] = useState<TriangulationAlgorithm>("SweepingLine");

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
        case "Delaunay":
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
        // Reset the options visibility.
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
            case "SweepingLine":
                setPoints(
                    EXAMPLE_POLYGON.map((p) => ({ id: crypto.randomUUID(), ...p })),
                );
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
            case "Delaunay":
                pushWarningNotification("No example implemented yet!");
                break;
            default:
                break;
        }
    };

    // React to changes of tab. When the tab is changed, clear the canvas and options completelly.
    useEffect(() => {
        setIsClosed(false);
        setPoints([]);
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
    }, [tab]);

    // Choose canvas based on the algorithm.
    const canvas = (() => {
        switch (tab) {
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
            case "Delaunay":
                return (
                    <DelaunayTriangulationCanvas
                        canvasSize={props.canvasSize}
                        options={options}
                        points={points}
                        flatTriangulationSet={[]}
                        onAddPoint={addPoint}
                        onDeletePoint={deletePoint}
                        onMovePoint={movePoint}
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
                                    label: "Using sweeping line",
                                    value: "SweepingLine",
                                },
                                {
                                    label: "Delaunay",
                                    value: "Delaunay",
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
