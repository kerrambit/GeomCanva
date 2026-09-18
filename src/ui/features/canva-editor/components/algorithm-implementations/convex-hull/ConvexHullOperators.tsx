import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { HandMoveActionIcon } from "../../../../../components/common/actionables/actions-icons/HandMoveActionIcon";
import { MinusActionIcon } from "../../../../../components/common/actionables/actions-icons/MinusActionIcon";
import { PlusActionIcon } from "../../../../../components/common/actionables/actions-icons/PlusActionIcon";
import type { ConvexHullOptions } from "./ConvexHullOptions";

export type ConvexHullOperatorsProps = {
    options: ConvexHullOptions;
    onOptionsChange: (options: ConvexHullOptions) => void;
};

export function ConvexHullOperators(props: ConvexHullOperatorsProps) {
    // State of currently selected mode.
    const selectMode = (mode: keyof ConvexHullOptions) => {
        const isActive = props.options[mode];

        props.onOptionsChange({
            draggableMode: !isActive && mode === "draggableMode",
            addableMode: !isActive && mode === "addableMode",
            deletableMode: !isActive && mode === "deletableMode",
        });
    };

    // Render the component.
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5em",
                width: "100%",
                padding: "1em",
            }}
        >
            <ActionableTile
                active={props.options.draggableMode}
                onClick={() => selectMode("draggableMode")}
                tooltip="Move points."
            >
                <HandMoveActionIcon onClick={() => {}}></HandMoveActionIcon>
            </ActionableTile>
            <ActionableTile
                active={props.options.addableMode}
                onClick={() => selectMode("addableMode")}
                tooltip="Add points."
            >
                <PlusActionIcon onClick={() => {}}></PlusActionIcon>
            </ActionableTile>
            <ActionableTile
                active={props.options.deletableMode}
                onClick={() => selectMode("deletableMode")}
                tooltip="Delete points."
            >
                <MinusActionIcon onClick={() => {}}></MinusActionIcon>
            </ActionableTile>
        </div>
    );
}
