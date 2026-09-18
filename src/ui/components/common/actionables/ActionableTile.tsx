/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type { ReactNode } from "react";

import "./ActionableTile.css";

interface ActionableTileProps {
    children?: ReactNode;
    active?: boolean;
    onClick?: () => void;
    tooltip?: string;
}

/**
 * ActionableTile is a component which is expected to take an `ActionIcon` as its child.
 * It adds a slight background and border, encapsulating it as a button-tile component.
 */
export function ActionableTile(props: ActionableTileProps) {
    return (
        <div
            className={`actionableTile${props.active ? " active" : ""}`}
            onClick={props.onClick}
            title={props.tooltip}
        >
            <div>{props.children}</div>
        </div>
    );
}
