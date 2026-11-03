import { useState } from "react";
import { Circle, Layer, Stage } from "react-konva";
import { useCanvasEditorColors } from "../../../hooks/useCanvasEditorColors";
import type { OrtogonalSearchingOptions } from "./OrtogonalSearchingOptions";
import type { Point } from "../math/Point";
import {
    POINT_RADIUS_BIG,
    POINT_RADIUS_NORMAL,
    POINT_FILL_DARK,
    POINT_FILL_LIGHT,
    POINT_SHADOW_BLUR,
    POINT_SHADOW_OPACITY,
} from "../common/CanvasConstants";

export type OrtogonalSearchingCanvasProps = {
    canvasSize: {
        width: number;
        height: number;
    };
    options: OrtogonalSearchingOptions;
    points: Point[];
    onAddPoint: (x: number, y: number) => void;
    onDeletePoint: (id: string) => void;
    onMovePoint: (id: string, x: number, y: number) => void;
};

export function OrtogonalSearchingCanvas(props: OrtogonalSearchingCanvasProps) {
    const { scheme, schemeAdjustedPrimaryColor } = useCanvasEditorColors();

    // Currently hovered point.
    const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

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
