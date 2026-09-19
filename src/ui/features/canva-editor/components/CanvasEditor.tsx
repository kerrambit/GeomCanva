/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import { SegmentedController } from "../../../components/common/segmented-controller/SegmentedController";
import { useConvexHullManager } from "./algorithm-implementations/convex-hull/ConvexHullManager";
import type { AlgorithmType } from "./AlgorithmType";
import type { AlgorithmManagerResult } from "./AlgorithmManagerResult";
import { AlgorithmWrapper } from "./AlgorithmWrapper";

import "./CanvasEditor.css";

export default function CanvasEditor() {
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
    const [tab, setTab] = useState<AlgorithmType>("convexHull");

    // Helper function to return the algorith hook reference.
    const getActiveHook = (selectedTab: AlgorithmType) => {
        switch (selectedTab) {
            case "convexHull":
                return useConvexHullManager;
        }
    };

    // Return the component.
    return (
        <AlgorithmWrapper
            key={tab}
            useManagerHook={getActiveHook(tab)}
            canvasSize={canvasSize}
            render={(manager: AlgorithmManagerResult) => (
                <div className="canva-editor">
                    <Sidebar>
                        <div style={{ padding: "0.3em" }}>
                            <SegmentedController<AlgorithmType>
                                value={tab}
                                onChange={setTab}
                                data={[
                                    {
                                        label: "Convex Hull",
                                        value: "convexHull",
                                    },
                                ]}
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
            )}
        />
    );
}
