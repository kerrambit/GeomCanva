import type React from "react";
import { Divider } from "@mantine/core";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import type { CommonOptions } from "../common/CommonOptions";
import { BroomActionIcon } from "../../../../../components/common/actionables/actions-icons/BroomActionIcon";
import { HandMoveActionIcon } from "../../../../../components/common/actionables/actions-icons/HandMoveActionIcon";
import { MinusActionIcon } from "../../../../../components/common/actionables/actions-icons/MinusActionIcon";
import { PlusActionIcon } from "../../../../../components/common/actionables/actions-icons/PlusActionIcon";

export type TriangulationOperatorsProps = {
    options: CommonOptions;
    optionsVisibility: CommonOptions;
    onOptionsChange: (options: CommonOptions) => void;
    onClear: () => void;
    topChildren?: React.ReactNode;
    bottomChildren?: React.ReactNode;
};

export function TriangulationOperators(props: TriangulationOperatorsProps) {
    // State of currently selected mode.
    const selectMode = (mode: keyof CommonOptions) => {
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
            {props.topChildren}
            {props.topChildren && <Divider mb={"lg"} mt={"lg"}></Divider>}
            {props.optionsVisibility.draggableMode && (
                <ActionableTile
                    active={props.options.draggableMode}
                    onClick={() => selectMode("draggableMode")}
                    tooltip="Move points."
                >
                    <HandMoveActionIcon onClick={() => {}}></HandMoveActionIcon>
                </ActionableTile>
            )}
            {props.optionsVisibility.addableMode && (
                <ActionableTile
                    active={props.options.addableMode}
                    onClick={() => selectMode("addableMode")}
                    tooltip="Add points."
                >
                    <PlusActionIcon onClick={() => {}}></PlusActionIcon>
                </ActionableTile>
            )}
            {props.optionsVisibility.deletableMode && (
                <ActionableTile
                    active={props.options.deletableMode}
                    onClick={() => selectMode("deletableMode")}
                    tooltip="Delete points."
                >
                    <MinusActionIcon onClick={() => {}}></MinusActionIcon>
                </ActionableTile>
            )}
            <Divider mb={"lg"} mt={"lg"}></Divider>
            <ActionableTile onClick={() => props.onClear()} tooltip="Clear canvas.">
                <BroomActionIcon onClick={() => {}}></BroomActionIcon>
            </ActionableTile>
            {props.bottomChildren && <Divider mb={"lg"} mt={"lg"}></Divider>}
            {props.bottomChildren}
        </div>
    );
}
