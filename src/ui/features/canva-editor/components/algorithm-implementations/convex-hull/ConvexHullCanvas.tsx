import { Circle, Layer, Stage, Line } from "react-konva";
import type { Point } from "../common/Point";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import { useCanvasEditorColors } from "../../../hooks/useCanvasEditorColors";

export type ConvexHullCanvasProps = {
    canvasSize: {
        width: number;
        height: number;
    };
    options: ConvexHullOptions;
    points: Point[];
    flatConvexHull: number[];
    onAddPoint: (x: number, y: number) => void;
    onDeletePoint: (id: string) => void;
    onMovePoint: (id: string, x: number, y: number) => void;
};

export function ConvexHullCanvas(props: ConvexHullCanvasProps) {
    const { scheme, schemeAdjustedPrimaryColor } = useCanvasEditorColors();

    // Render the component.
    return (
        <Stage
            width={props.canvasSize.width}
            height={props.canvasSize.height}
            onClick={(event) => {
                if (!props.options.addableMode || event.target !== event.currentTarget) {
                    return;
                }

                const position = event.target.getStage()?.getPointerPosition();

                if (position) {
                    props.onAddPoint(position.x, position.y);
                }
            }}
        >
            <Layer>
                {props.flatConvexHull.length > 4 && (
                    <Line
                        points={props.flatConvexHull}
                        stroke={schemeAdjustedPrimaryColor}
                        strokeWidth={1}
                        lineJoin="round"
                    />
                )}
                {props.points.map((point) => (
                    <Circle
                        key={point.id}
                        x={point.x}
                        y={point.y}
                        radius={5}
                        fill={scheme === "dark" ? "white" : "black"}
                        draggable={props.options.draggableMode}
                        onClick={() => {
                            if (props.options.deletableMode) {
                                props.onDeletePoint(point.id);
                            }
                        }}
                        onDragMove={(event) => {
                            const position = event.target.position();
                            props.onMovePoint(point.id, position.x, position.y);
                        }}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
