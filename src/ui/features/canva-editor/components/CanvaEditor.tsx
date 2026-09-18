/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { SegmentedController } from "../../../components/common/segmented-controller/SegmentedController";
import { useConvexHullManager } from "./algorithm-implementations/convex-hull/ConvexHullManager";

import "./CanvaEditor.css";

export default function CanvaEditor() {
    // Canvas state.
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // When window is resized, adapt canvas window as well.
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

    // Algorithm selection.
    type AlgorithmType = "convexHull";
    const [tab, setTab] = useState<AlgorithmType>("convexHull");

    // Initialized algorithms.
    // TODO: do it lazily
    const convexHull = useConvexHullManager({ canvasSize });

    const getManager = (selectedTab: AlgorithmType) => {
        switch (selectedTab) {
            case "convexHull":
                return convexHull;
        }
    };

    // Current manager.
    const manager = getManager(tab);

    // Return the component.
    return (
        <div className="canva-editor">
            <Sidebar>
                <div style={{ padding: "0.3em" }}>
                    <SegmentedController<AlgorithmType>
                        value={tab}
                        onChange={setTab}
                        data={[{ label: "Convex Hull", value: "convexHull" }]}
                        widthWrapOrientationLimit={292}
                    />
                </div>
                <div className="canva-editor__sidebar-content">
                    {manager.operators}
                </div>
            </Sidebar>
            <div ref={canvasRef} className="canva-editor__canvas">
                {manager.canvas}
            </div>
        </div>
    );
}
