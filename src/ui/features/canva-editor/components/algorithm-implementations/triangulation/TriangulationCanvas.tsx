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
    onPolygonReopened: () => void;
};

export function TriangulationCanvas(props: TriangulationCanvasProps) {
    // Use canvas editor colors.
    const {
        scheme,
        schemeAdjustedPrimaryColor,
        primaryColorForLightScheme1,
        primaryColorForDarkScheme9,
    } = useCanvasEditorColors();

    // Currently hovered point.
    const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

    // Is polygon enclosed.
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        if (props.points.length < 3) {
            setIsClosed(false);
            props.onPolygonReopened();
        }
    }, [props.points.length]);

    const hasSelfIntersections = (testPoints: Point[], checkClosed: boolean) => {
        const n = testPoints.length;
        if (n < 4) {
            return false;
        }

        const edges: { p1: Point; p2: Point }[] = [];
        for (let i = 0; i < n - 1; i++) {
            edges.push({ p1: testPoints[i], p2: testPoints[i + 1] });
        }
        if (checkClosed) {
            edges.push({ p1: testPoints[n - 1], p2: testPoints[0] });
        }

        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 2; j < edges.length; j++) {
                // Skip checking the first and last edge against each other since they share the start vertex.
                if (checkClosed && i === 0 && j === edges.length - 1) {
                    continue;
                }

                if (
                    doesTwoLineSegmentsIntersect(
                        edges[i].p1,
                        edges[i].p2,
                        edges[j].p1,
                        edges[j].p2,
                    )
                ) {
                    return true;
                }
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
                    const proposedPoints = [
                        ...props.points,
                        { id: "temp", x: position.x, y: position.y },
                    ];
                    if (hasSelfIntersections(proposedPoints, false)) {
                        return;
                    }

                    props.onAddPoint(position.x, position.y);
                }
            }}
            onMouseMove={(event) => {
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
                    const proposedPoints = [
                        ...props.points,
                        { id: "temp", x: position.x, y: position.y },
                    ];
                    if (hasSelfIntersections(proposedPoints, false)) {
                        container.style.cursor = "not-allowed";
                    } else {
                        container.style.cursor = "default";
                    }
                }
            }}
            onMouseLeave={(event) => {
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
                        fill={
                            scheme === "light"
                                ? primaryColorForLightScheme1
                                : primaryColorForDarkScheme9
                        }
                    />
                )}

                {props.points.map((point, index) => {
                    const isFirstPoint = index === 0;

                    const canCloseShape =
                        isFirstPoint && !isClosed && props.points.length >= 3;

                    const isHovered = hoveredPointId === point.id;

                    const isValidDelete =
                        props.options.deletableMode &&
                        !hasSelfIntersections(
                            props.points.filter((p) => p.id !== point.id),
                            isClosed,
                        );

                    const isValidClose =
                        canCloseShape && !hasSelfIntersections(props.points, true);

                    const showGlow =
                        isHovered &&
                        (isValidClose || isValidDelete || props.options.draggableMode);

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
                            dragBoundFunc={(pos) => {
                                const proposedPoints = props.points.map((p) =>
                                    p.id === point.id ? { ...p, x: pos.x, y: pos.y } : p,
                                );

                                if (hasSelfIntersections(proposedPoints, isClosed)) {
                                    return { x: point.x, y: point.y };
                                }
                                return pos;
                            }}
                            onClick={(event) => {
                                if (canCloseShape) {
                                    if (!isValidClose) {
                                        return;
                                    }
                                    setIsClosed(true);
                                    props.onPolygonEnclosed();
                                    return;
                                }

                                if (props.options.deletableMode) {
                                    if (!isValidDelete) {
                                        return;
                                    }

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
                                const container = event.target.getStage()?.container();
                                if (!container) return;

                                if (canCloseShape) {
                                    container.style.cursor = isValidClose
                                        ? "pointer"
                                        : "not-allowed";
                                } else if (props.options.deletableMode) {
                                    container.style.cursor = isValidDelete
                                        ? "pointer"
                                        : "not-allowed";
                                } else if (props.options.draggableMode) {
                                    container.style.cursor = "pointer";
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
