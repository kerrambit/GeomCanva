/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { ActionIcon } from "@mantine/core";
import { IconMinus } from "@tabler/icons-react";
import { useAppearance } from "../../../../hooks/useAppearance";

interface MinusActionIconProps {
    tooltip?: string;
    enabled?: boolean;
    onClick: () => void;
}

export function MinusActionIcon(props: MinusActionIconProps) {
    // Use apperance.
    const { colorScheme } = useAppearance();

    // Choose optimal color based on color scheme.
    const optimalColor =
        colorScheme === "dark" ? "var(--color-light)" : "var(--color-dark)";

    // Render the component.
    return (
        <ActionIcon
            disabled={props.enabled ?? false}
            color={optimalColor}
            variant="subtle"
            onClick={props.onClick}
            title={props.tooltip}
        >
            <IconMinus size={18} />
        </ActionIcon>
    );
}
