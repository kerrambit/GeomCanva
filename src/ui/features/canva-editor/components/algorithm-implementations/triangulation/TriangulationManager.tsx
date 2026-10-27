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

    // Triangulation.
    let flatTriangulationSet;
    switch (tab) {
        case "SweepingLine":
            flatTriangulationSet =
                SweepingLineTriangulation.triangulateFlatPolygon(points);
            break;
        default:
            flatTriangulationSet =
                SweepingLineTriangulation.triangulateFlatPolygon(points);
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
                    </Group>
                }
            />
        ),
        canvas: (
            <TriangulationCanvas
                canvasSize={props.canvasSize}
                options={options}
                points={points}
                flatTriangulationSet={flatTriangulationSet}
                onAddPoint={addPoint}
                onDeletePoint={deletePoint}
                onMovePoint={movePoint}
                onPolygonEnclosed={handleEnclosedPolygon}
                onPolygonReopened={handleReopenedPolygon}
            />
        ),
    };
}
