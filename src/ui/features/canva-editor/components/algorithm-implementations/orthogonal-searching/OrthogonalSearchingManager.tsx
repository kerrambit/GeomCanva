import { useState } from "react";
import { OrtogonalSearchingCanvas } from "./OrtogonalSearchingCanvas";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import type { OrtogonalSearchingOptions } from "./OrtogonalSearchingOptions";
import { CommonOperators } from "../common/CommonOperators";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import type { Point } from "../math/Point";
import { Group } from "@mantine/core";
import { InfoMessage } from "../../../../../components/common/messages/InfoMessage";
import { IconCalculator } from "@tabler/icons-react";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";

type OrtogonalSearchingManagerProps = {
    canvasSize: {
        width: number;
        height: number;
    };
};

type OrtogonalSearchingAlgorithm = "kDTree";

export function useOrtogonalSearchingManager(
    props: OrtogonalSearchingManagerProps,
): AlgorithmManagerResult {
    // Options.
    const [options, setOptions] = useState<OrtogonalSearchingOptions>({
        draggableMode: false,
        addableMode: true,
        deletableMode: false,
    });

    // Type of convex hull algorithm.
    const [tab, setTab] = useState<OrtogonalSearchingAlgorithm>("kDTree");

    // Points.
    const [points, setPoints] = useState<Point[]>([]);

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

    // Handler to calculate k-D tree.
    const calculate = () => {};

    return {
        operators: (
            <CommonOperators
                options={options}
                onOptionsChange={setOptions}
                onClear={clearCanvas}
                onGenerateRandomPoints={generateRandomPoints}
                topChildren={
                    <Group>
                        <SegmentedController<OrtogonalSearchingAlgorithm>
                            value={tab}
                            onChange={setTab}
                            data={[
                                {
                                    label: "k-D Tree",
                                    value: "kDTree",
                                },
                            ]}
                            widthWrapOrientationLimit={292}
                        />

                        <InfoMessage
                            iconSize={50}
                            text="Place points and then click 'Calculate' button to visualize the k-D Tree dividing lines."
                        ></InfoMessage>
                    </Group>
                }
                bottomChildren={
                    <ActionableTile
                        onClick={calculate}
                        tooltip="Calculates k-D Tree and shows its dividing lines."
                    >
                        <IconCalculator size={20} onClick={() => {}}></IconCalculator>
                    </ActionableTile>
                }
            />
        ),
        canvas: (
            <OrtogonalSearchingCanvas
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
