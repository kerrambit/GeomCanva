/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/common/sidebar/Sidebar";
import type { AlgorithmType } from "./AlgorithmType";
import type { AlgorithmManagerResult } from "./AlgorithmManagerResult";
import { AlgorithmWrapper } from "./AlgorithmWrapper";
import { SegmentedController } from "../../../components/common/segmented-controller/SegmentedController";
import { useConvexHullManager } from "./algorithm-implementations/convex-hull/ConvexHullManager";
import { useTriangulationManager } from "./algorithm-implementations/triangulation/TriangulationManager";
import { useOrtogonalSearchingManager } from "./algorithm-implementations/orthogonal-searching/OrthogonalSearchingManager";

import "./CanvasEditor.css";

export default function CanvasEditor() {
    // Canvas state.
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Algorithm selection.
    const [tab, setTab] = useState<AlgorithmType>("ConvexHull");

    // When window is resized or when algorithm changes, adapt canvas window as well.
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
    }, [tab]);

    // Helper function to return the algorith hook reference.
    // Assuming your hooks take something like `{ canvasSize }` and return `AlgorithmManagerResult`
    type AlgorithmManagerHook = (params: {
        canvasSize: { width: number; height: number };
    }) => AlgorithmManagerResult;

    const getActiveHook = (selectedTab: AlgorithmType): AlgorithmManagerHook => {
        switch (selectedTab) {
            case "ConvexHull":
                return useConvexHullManager;
            case "Triangulation":
                return useTriangulationManager;
            case "OrthogonalSearching":
                return useOrtogonalSearchingManager;
            default:
                throw new Error(`Unsupported algorithm: '${selectedTab}'!`);
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
                                        value: "ConvexHull",
                                    },
                                    {
                                        label: "Triangulation",
                                        value: "Triangulation",
                                    },
                                    {
                                        label: "Ortogonal Searching",
                                        value: "OrthogonalSearching",
                                    },
                                ]}
                                orientation="vertical"
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
