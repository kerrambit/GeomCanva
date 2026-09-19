import { useAppearance } from "../../../hooks/useAppearance";

export function useCanvasEditorColors() {
    // Use apperance.
    const appearance = useAppearance();
    const scheme = appearance.colorScheme;
    const primaryColor = appearance.colorTheme.primaryColor;
    const primaryColorTuple = appearance.colorTheme.colors[primaryColor];

    const primaryColorForLightScheme = primaryColorTuple?.[8] ?? "black";
    const primaryColorForDarkScheme = primaryColorTuple?.[2] ?? "white";

    return {
        scheme: scheme,
        schemeAdjustedPrimaryColor:
            scheme === "dark"
                ? primaryColorForDarkScheme
                : primaryColorForLightScheme,
    };
}
