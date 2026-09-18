import { Circle, Layer, Stage } from "react-konva";
import type { ConvexHullOptions } from "./ConvexHullOptions";
import type { Point } from "../common/Point";

export type ConvexHullCanvasProps = {
    canvasSize: {
        width: number;
        height: number;
    };
    options: ConvexHullOptions;
    points: Point[];
    onAddPoint: (x: number, y: number) => void;
    onDeletePoint: (id: number) => void;
    onMovePoint: (id: number, x: number, y: number) => void;
};

export function ConvexHullCanvas(props: ConvexHullCanvasProps) {
    // Render the component.
    return (
        <Stage
            width={props.canvasSize.width}
            height={props.canvasSize.height}
            onClick={(event) => {
                if (
                    !props.options.addableMode ||
                    event.target !== event.currentTarget
                ) {
                    return;
                }

                const position = event.target.getStage()?.getPointerPosition();

                if (position) {
                    props.onAddPoint(position.x, position.y);
                }
            }}
        >
            <Layer>
                {props.points.map((point) => (
                    <Circle
                        key={point.id}
                        x={point.x}
                        y={point.y}
                        radius={6}
                        fill={"black"}
                        draggable={props.options.draggableMode}
                        onClick={() => {
                            if (props.options.deletableMode) {
                                props.onDeletePoint(point.id);
                            }
                        }}
                        onDragEnd={(event) => {
                            const position = event.target.position();
                            props.onMovePoint(point.id, position.x, position.y);
                        }}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
