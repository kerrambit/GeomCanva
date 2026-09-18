/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { Button } from "@mantine/core";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";

import "./CanvaEditor.css";

export default function CanvaEditor() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvasElement = canvasRef.current;

        if (!canvasElement) {
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            setCanvasSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });

        resizeObserver.observe(canvasElement);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="canva-editor">
            <Sidebar>
                <div className="canva-editor__sidebar-content">
                    <Button>Click on me</Button>
                </div>
            </Sidebar>
            <div ref={canvasRef} className="canva-editor__canvas">
                <Stage width={canvasSize.width} height={canvasSize.height}>
                    <Layer>
                        <Rect
                            x={50}
                            y={50}
                            width={120}
                            height={80}
                            fill={"#00a8e8"}
                            draggable
                            onClick={() => {}}
                        />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
