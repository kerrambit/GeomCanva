import { useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { useCanvasEditorColors } from "../../../hooks/useCanvasEditorColors";
import type { OrtogonalSearchingOptions } from "./OrtogonalSearchingOptions";
import type { Point } from "../math/Point";
import type { KdTreeDividingLine } from "./KdTree";
import {
    POINT_RADIUS_BIG,
    POINT_RADIUS_NORMAL,
    POINT_FILL_DARK,
    POINT_FILL_LIGHT,
    POINT_SHADOW_BLUR,
    POINT_SHADOW_OPACITY,
    LINE_WIDTH,
    LINE_DASH,
} from "../common/CanvasConstants";

const DIVIDING_LINE_COLORS = {
    light: { x: "#C92A2A", y: "#1864AB" },
    dark: { x: "#FF6B6B", y: "#4DABF7" },
} as const;

const LINE_WIDTH_HIGHLIGHTED = LINE_WIDTH * 5;

export type OrtogonalSearchingCanvasProps = {
    canvasSize: {
        width: number;
        height: number;
    };
    options: OrtogonalSearchingOptions;
    points: Point[];
    dividingLines: KdTreeDividingLine[];
    depth?: number;
    onAddPoint: (x: number, y: number) => void;
    onDeletePoint: (id: string) => void;
    onMovePoint: (id: string, x: number, y: number) => void;
};

export function OrtogonalSearchingCanvas(props: OrtogonalSearchingCanvasProps) {
    const { scheme, schemeAdjustedPrimaryColor } = useCanvasEditorColors();

    // Currently hovered point.
    const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

    // Line colors.
    const lineColors = DIVIDING_LINE_COLORS[scheme === "dark" ? "dark" : "light"];

    // Render the component.
    return (
        <Stage
            width={props.canvasSize.width}
            height={props.canvasSize.height}
            onClick={(event) => {
                // Prevent adding points if clicking an existing circle
                if (!props.options.addableMode || event.target.className === "Circle") {
                    return;
                }

                const position = event.target.getStage()?.getPointerPosition();

                if (position) {
                    props.onAddPoint(position.x, position.y);
                }
            }}
        >
            <Layer>
                {props.dividingLines.map((line, index) => {
                    const isHighlighted =
                        props.depth !== undefined && line.depth === props.depth;

                    return (
                        <Line
                            key={`dividing-line-${index}`}
                            points={line.points}
                            stroke={lineColors[line.axis]}
                            strokeWidth={
                                isHighlighted ? LINE_WIDTH_HIGHLIGHTED : LINE_WIDTH
                            }
                            dash={LINE_DASH}
                            closed={false}
                            listening={false}
                        />
                    );
                })}

                {props.points.map((point) => {
                    const isHovered = hoveredPointId === point.id;
                    const showGlow =
                        isHovered &&
                        (props.options.deletableMode || props.options.draggableMode);

                    return (
                        <Circle
                            key={point.id}
                            x={point.x}
                            y={point.y}
                            radius={showGlow ? POINT_RADIUS_BIG : POINT_RADIUS_NORMAL}
                            fill={scheme === "dark" ? POINT_FILL_DARK : POINT_FILL_LIGHT}
                            draggable={props.options.draggableMode}
                            shadowColor={schemeAdjustedPrimaryColor}
                            shadowBlur={showGlow ? POINT_SHADOW_BLUR : 0}
                            shadowOpacity={showGlow ? POINT_SHADOW_OPACITY : 0}
                            onClick={(event) => {
                                if (props.options.deletableMode) {
                                    setHoveredPointId(null);
                                    const container = event.target
                                        .getStage()
                                        ?.container();
                                    if (container) container.style.cursor = "default";

                                    props.onDeletePoint(point.id);
                                }
                            }}
                            onDragMove={(event) => {
                                const position = event.target.position();
                                props.onMovePoint(point.id, position.x, position.y);
                            }}
                            onMouseEnter={(event) => {
                                setHoveredPointId(point.id);
                                if (
                                    props.options.deletableMode ||
                                    props.options.draggableMode
                                ) {
                                    const container = event.target
                                        .getStage()
                                        ?.container();
                                    if (container) container.style.cursor = "pointer";
                                }
                            }}
                            onMouseLeave={(event) => {
                                setHoveredPointId(null);
                                const container = event.target.getStage()?.container();
                                if (container) container.style.cursor = "default";
                            }}
                        />
                    );
                })}
            </Layer>
        </Stage>
    );
}
