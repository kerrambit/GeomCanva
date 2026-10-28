import { useState } from "react";
import type { Point } from "../common/Point";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import type { TriangulationOptions } from "./TriangulationOptions";
import { TriangulationOperators } from "./TriangulationOperators";
import { SweepingLineTriangulation } from "./SweepingLineTriangulation";
import { TriangulationCanvas } from "./TriangulationCanvas";
import { InfoMessage } from "../../../../../components/common/messages/InfoMessage";
import { Group } from "@mantine/core";
import { MonotonePolygon } from "./MonotonePolygon";
import { WarningMessage } from "../../../../../components/common/messages/WarningMessage";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { IconTestPipe } from "@tabler/icons-react";

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

type TriangulationAlgorithm = "SweepingLine";

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

    // Is polygon enclosed.
    const [isClosed, setIsClosed] = useState(false);

    // Type of triangulation algorithm.
    const [tab, setTab] = useState<TriangulationAlgorithm>("SweepingLine");

    // Points.
    const [points, setPoints] = useState<Point[]>([]);

    let flatTriangulationSet: number[] = [];
    const warnings: string[] = [];

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

    // Handle enclosed polygon.
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

    // Handle reopened polygon.
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
        setPoints(EXAMPLE_POLYGON.map((p) => ({ id: crypto.randomUUID(), ...p })));
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
                            ]}
                            widthWrapOrientationLimit={292}
                        />

                        {!isClosed && (
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
        canvas: (
            <TriangulationCanvas
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
        ),
    };
}
