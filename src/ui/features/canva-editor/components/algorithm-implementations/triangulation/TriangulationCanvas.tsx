import { useState, useEffect } from "react";
import { Circle, Layer, Stage, Line } from "react-konva";
import { flatPointsArray, type Point } from "../common/Point";
import { useCanvasEditorColors } from "../../../hooks/useCanvasEditorColors";
import type { TriangulationOptions } from "./TriangulationOptions";
import { doesTwoLineSegmentsIntersect } from "../common/LineSegmentsIntersection";

export type TriangulationCanvasProps = {
    canvasSize: { width: number; height: number };
    options: TriangulationOptions;
    points: Point[];
    flatTriangulationSet: number[];
    onAddPoint: (x: number, y: number) => void;
    onDeletePoint: (id: string) => void;
    onMovePoint: (id: string, x: number, y: number) => void;
    onPolygonEnclosed: () => void;
};

export function TriangulationCanvas(props: TriangulationCanvasProps) {
    // Use canvas editor colors.
    const { scheme, schemeAdjustedPrimaryColor } = useCanvasEditorColors();

    // Currently hovered point.
    const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

    // Is polygon enclosed.
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        if (props.points.length < 3) {
            setIsClosed(false);
        }
    }, [props.points.length]);

    // Helper to check if a new point at (newX, newY) would cause an intersection.
    const checkIntersection = (newX: number, newY: number) => {
        if (props.points.length < 2) return false;

        const pLast = props.points[props.points.length - 1];
        const pNew: Point = { id: "temp", x: newX, y: newY };

        for (let i = 0; i < props.points.length - 2; i++) {
            const p1 = props.points[i];
            const q1 = props.points[i + 1];

            if (doesTwoLineSegmentsIntersect(p1, q1, pLast, pNew)) {
                return true;
            }
        }
        return false;
    };

    // Render the component.
    return (
        <Stage
            width={props.canvasSize.width}
            height={props.canvasSize.height}
            onClick={(event) => {
                if (
                    !props.options.addableMode ||
                    isClosed ||
                    event.target.className === "Circle"
                ) {
                    return;
                }

                const position = event.target.getStage()?.getPointerPosition();
                if (position) {
                    // Block adding the point if it intersects
                    if (checkIntersection(position.x, position.y)) {
                        return;
                    }
                    props.onAddPoint(position.x, position.y);
                }
            }}
            onMouseMove={(event) => {
                // Ignore cursor calculations if we aren't adding points, or if we are hovering a Circle.
                if (
                    !props.options.addableMode ||
                    isClosed ||
                    event.target.className === "Circle"
                ) {
                    return;
                }

                const position = event.target.getStage()?.getPointerPosition();
                const container = event.target.getStage()?.container();

                if (position && container) {
                    if (checkIntersection(position.x, position.y)) {
                        container.style.cursor = "not-allowed";
                    } else {
                        container.style.cursor = "default";
                    }
                }
            }}
            onMouseLeave={(event) => {
                // Ensure cursor resets when leaving the canvas
                const container = event.target.getStage()?.container();
                if (container) container.style.cursor = "default";
            }}
        >
            <Layer>
                {props.flatTriangulationSet.length > 4 && (
                    <Line
                        points={props.flatTriangulationSet}
                        stroke={schemeAdjustedPrimaryColor}
                        strokeWidth={1}
                        lineJoin="round"
                    />
                )}

                {props.points.length > 1 && (
                    <Line
                        points={flatPointsArray(props.points)}
                        stroke={schemeAdjustedPrimaryColor}
                        strokeWidth={1}
                        lineJoin="round"
                        closed={isClosed}
                    />
                )}

                {props.points.map((point, index) => {
                    const isFirstPoint = index === 0;
                    const canCloseShape =
                        isFirstPoint && !isClosed && props.points.length >= 3;
                    const isHovered = hoveredPointId === point.id;

                    const showGlow =
                        isHovered &&
                        (canCloseShape ||
                            props.options.deletableMode ||
                            props.options.draggableMode);

                    return (
                        <Circle
                            key={point.id}
                            x={point.x}
                            y={point.y}
                            radius={showGlow ? 8 : 5}
                            fill={scheme === "dark" ? "white" : "black"}
                            draggable={props.options.draggableMode}
                            shadowColor={schemeAdjustedPrimaryColor}
                            shadowBlur={showGlow ? 15 : 0}
                            shadowOpacity={showGlow ? 0.8 : 0}
                            onClick={() => {
                                if (canCloseShape) {
                                    setIsClosed(true);
                                    props.onPolygonEnclosed();
                                    return;
                                }

                                if (props.options.deletableMode) {
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
                                    canCloseShape ||
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
