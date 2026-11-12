import { useState, useEffect } from "react";
import { Circle, Layer, Stage, Line } from "react-konva";
import { useCanvasEditorColors } from "../../../hooks/useCanvasEditorColors";
import type { TriangulationOptions } from "./TriangulationOptions";
import { doesTwoLineSegmentsIntersect } from "../math/LineSegmentsIntersection";
import { type Point, flatPointsArray } from "../math/Point";
import {
    LINE_DASH,
    LINE_WIDTH,
    POINT_FILL_DARK,
    POINT_FILL_LIGHT,
    POINT_RADIUS_BIG,
    POINT_RADIUS_NORMAL,
    POINT_SHADOW_BLUR,
    POINT_SHADOW_OPACITY,
} from "../common/CanvasConstants";

export type TriangulationCanvasProps = {
    canvasSize: { width: number; height: number };
    options: TriangulationOptions;
    points: Point[];
    flatTriangulationSet: number[];
    isClosed: boolean;
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

    useEffect(() => {
        if (props.points.length < 3) {
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

    // Prepare diagonals for rendering (chunks of 4).
    const diagonals = [];
    for (let i = 0; i < props.flatTriangulationSet.length; i += 4) {
        diagonals.push(props.flatTriangulationSet.slice(i, i + 4));
    }

    // Render the component.
    return (
        <Stage
            width={props.canvasSize.width}
            height={props.canvasSize.height}
            onClick={(event) => {
                if (
                    !props.options.addableMode ||
                    props.isClosed ||
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
                    props.isClosed ||
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
                {props.points.length > 1 && (
                    <Line
                        points={flatPointsArray(props.points)}
                        stroke={schemeAdjustedPrimaryColor}
                        strokeWidth={LINE_WIDTH}
                        closed={props.isClosed}
                        fill={
                            scheme === "light"
                                ? primaryColorForLightScheme1
                                : primaryColorForDarkScheme9
                        }
                    />
                )}

                {props.flatTriangulationSet.length > 0 &&
                    diagonals.map((diagonalPoints, index) => (
                        <Line
                            key={`diag-${index}`}
                            points={diagonalPoints}
                            stroke={schemeAdjustedPrimaryColor}
                            strokeWidth={LINE_WIDTH}
                            dash={LINE_DASH}
                            closed={false}
                        />
                    ))}
                {props.points.map((point, index) => {
                    const isFirstPoint = index === 0;

                    const canCloseShape =
                        isFirstPoint && !props.isClosed && props.points.length >= 3;

                    const isHovered = hoveredPointId === point.id;

                    const isValidDelete =
                        props.options.deletableMode &&
                        !hasSelfIntersections(
                            props.points.filter((p) => p.id !== point.id),
                            props.isClosed,
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
                            radius={showGlow ? POINT_RADIUS_BIG : POINT_RADIUS_NORMAL}
                            fill={scheme === "dark" ? POINT_FILL_DARK : POINT_FILL_LIGHT}
                            draggable={props.options.draggableMode}
                            shadowColor={schemeAdjustedPrimaryColor}
                            shadowBlur={showGlow ? POINT_SHADOW_BLUR : 0}
                            shadowOpacity={showGlow ? POINT_SHADOW_OPACITY : 0}
                            dragBoundFunc={(pos) => {
                                const proposedPoints = props.points.map((p) =>
                                    p.id === point.id ? { ...p, x: pos.x, y: pos.y } : p,
                                );

                                if (
                                    hasSelfIntersections(proposedPoints, props.isClosed)
                                ) {
                                    return { x: point.x, y: point.y };
                                }
                                return pos;
                            }}
                            onClick={(event) => {
                                if (canCloseShape) {
                                    if (!isValidClose) {
                                        return;
                                    }
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
