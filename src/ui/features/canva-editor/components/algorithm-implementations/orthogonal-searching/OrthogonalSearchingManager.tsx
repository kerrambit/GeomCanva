import { useMemo, useState } from "react";
import { OrtogonalSearchingCanvas } from "./OrtogonalSearchingCanvas";
import type { AlgorithmManagerResult } from "../../AlgorithmManagerResult";
import type { OrtogonalSearchingOptions } from "./OrtogonalSearchingOptions";
import { CommonOperators } from "../common/CommonOperators";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import { createPoint, type Point } from "../math/Point";
import { Checkbox, Divider, Group, Slider } from "@mantine/core";
import { InfoMessage } from "../../../../../components/common/messages/InfoMessage";
import { IconCalculator, IconTestPipe } from "@tabler/icons-react";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { KdTree, type KdTreeDividingLine } from "./KdTree";
import { WarningMessage } from "../../../../../components/common/messages/WarningMessage";

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

    // Type of orthogonal searching algorithm.
    const [tab, setTab] = useState<OrtogonalSearchingAlgorithm>("kDTree");

    // Points and visualization trigger.
    const [points, setPoints] = useState<Point[]>([]);
    const [showDividingLines, setShowDividingLines] = useState(false);

    // Depth highlighting.
    const [highlightDepthEnabled, setHighlightDepthEnabled] = useState(false);
    const [highlightedDepth, setHighlightedDepth] = useState(0);

    // k-D tree is built only after the user clicked "Calculate".
    const kDTreeResult = useMemo(() => {
        return showDividingLines ? KdTree.create(points) : null;
    }, [showDividingLines, points]);
    const kDTree = kDTreeResult?.success ? kDTreeResult.value : null;

    // Dividing lines are derived from the tree and the canvas size.
    const dividingLines = useMemo(() => {
        if (!kDTree) {
            return [];
        }

        const lines: KdTreeDividingLine[] = [];
        kDTree.getDividingLines(lines, {
            x: { min: 0, max: props.canvasSize.width },
            y: { min: 0, max: props.canvasSize.height },
        });
        return lines;
    }, [kDTree, props.canvasSize.width, props.canvasSize.height]);

    // Maximum depth of a node (the root has depth 0).
    const maxDepth = useMemo(
        () => (kDTree ? Math.max(0, kDTree.getHeight() - 2) : 0), // Do not include leafs.
        [kDTree],
    );

    // Selected depth clamped to the current tree (the tree can shrink after recalculation).
    const depth = Math.min(highlightedDepth, maxDepth);

    // Errors and warning.
    const error =
        kDTreeResult && !kDTreeResult.success ? kDTreeResult.error.message : null;

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
        setShowDividingLines(false);
    };

    // Handler to delete point.
    const deletePoint = (id: string) => {
        setPoints((currentPoints) => currentPoints.filter((point) => point.id !== id));
        setShowDividingLines(false);
    };

    // Handler to move point.
    const movePoint = (id: string, x: number, y: number) => {
        setPoints((currentPoints) =>
            currentPoints.map((point) => (point.id === id ? { ...point, x, y } : point)),
        );
        setShowDividingLines(false);
    };

    // Handler to clear canvas.
    const clearCanvas = () => {
        setPoints([]);
        setShowDividingLines(false);
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
        setShowDividingLines(false);
    };

    // Handler to calculate k-D tree.
    const calculate = () => {
        setShowDividingLines(true);
    };

    // Handler to show example.
    const showExample = () => {
        setPoints([
            createPoint(189, 461, "p1"),
            createPoint(276, 351, "p2"),
            createPoint(297, 549, "p3"),
            createPoint(189, 198, "p4"),
            createPoint(385, 220, "p5"),
            createPoint(582, 592, "p6"),
            createPoint(473, 439, "p7"),
            createPoint(626, 505, "p8"),
            createPoint(539, 198, "p9"),
            createPoint(560, 286, "p10"),
        ]);
        setShowDividingLines(false);
    };

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
                        {error && (
                            <WarningMessage
                                style={{ width: "100%" }}
                                iconSize={25}
                                text={error}
                            ></WarningMessage>
                        )}
                    </Group>
                }
                bottomChildren={
                    <div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5em",
                                width: "100%",
                            }}
                        >
                            <ActionableTile onClick={showExample} tooltip="Show example.">
                                <IconTestPipe onClick={() => {}}></IconTestPipe>
                            </ActionableTile>
                            <ActionableTile
                                onClick={calculate}
                                tooltip="Calculates k-D Tree and shows its dividing lines."
                            >
                                <IconCalculator
                                    size={20}
                                    onClick={() => {}}
                                ></IconCalculator>
                            </ActionableTile>
                        </div>
                        <Divider mb={"lg"} mt={"lg"}></Divider>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: "0.5em",
                            }}
                        >
                            <Checkbox
                                label="Highlight depth"
                                checked={highlightDepthEnabled}
                                disabled={!kDTree}
                                title={
                                    !kDTree
                                        ? "First, calculate the k-D tree!"
                                        : "Marks the dividing lines of the given depth."
                                }
                                onChange={(event) =>
                                    setHighlightDepthEnabled(event.currentTarget.checked)
                                }
                            />
                            {highlightDepthEnabled && kDTree && (
                                <Slider
                                    style={{ flex: 1, minWidth: 100 }}
                                    min={0}
                                    max={Math.max(maxDepth, 1)}
                                    step={1}
                                    value={depth}
                                    onChange={setHighlightedDepth}
                                    disabled={maxDepth === 0}
                                    label={(value) => `Depth ${value}`}
                                />
                            )}
                        </div>
                    </div>
                }
            />
        ),
        canvas: (
            <OrtogonalSearchingCanvas
                canvasSize={props.canvasSize}
                options={options}
                points={points}
                dividingLines={dividingLines}
                depth={highlightDepthEnabled && kDTree ? depth : undefined}
                onAddPoint={addPoint}
                onDeletePoint={deletePoint}
                onMovePoint={movePoint}
            />
        ),
    };
}
