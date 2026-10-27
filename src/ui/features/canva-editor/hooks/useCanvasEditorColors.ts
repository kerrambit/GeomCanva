import { useAppearance } from "../../../hooks/useAppearance";

export function useCanvasEditorColors() {
    // Use appearance.
    const appearance = useAppearance();
    const scheme = appearance.colorScheme;
    const primaryColor = appearance.colorTheme.primaryColor;
    const primaryColorTuple = appearance.colorTheme.colors[primaryColor];

    const primaryColorForLightScheme9 = primaryColorTuple?.[9] ?? "black";
    const primaryColorForLightScheme8 = primaryColorTuple?.[8] ?? "black";
    const primaryColorForLightScheme7 = primaryColorTuple?.[7] ?? "black";
    const primaryColorForLightScheme6 = primaryColorTuple?.[6] ?? "black";
    const primaryColorForLightScheme5 = primaryColorTuple?.[5] ?? "black";
    const primaryColorForLightScheme4 = primaryColorTuple?.[4] ?? "black";
    const primaryColorForLightScheme3 = primaryColorTuple?.[3] ?? "black";
    const primaryColorForLightScheme2 = primaryColorTuple?.[2] ?? "black";
    const primaryColorForLightScheme1 = primaryColorTuple?.[1] ?? "black";
    const primaryColorForLightScheme0 = primaryColorTuple?.[0] ?? "black";

    const primaryColorForDarkScheme9 = primaryColorTuple?.[9] ?? "white";
    const primaryColorForDarkScheme8 = primaryColorTuple?.[8] ?? "white";
    const primaryColorForDarkScheme7 = primaryColorTuple?.[7] ?? "white";
    const primaryColorForDarkScheme6 = primaryColorTuple?.[6] ?? "white";
    const primaryColorForDarkScheme5 = primaryColorTuple?.[5] ?? "white";
    const primaryColorForDarkScheme4 = primaryColorTuple?.[4] ?? "white";
    const primaryColorForDarkScheme3 = primaryColorTuple?.[3] ?? "white";
    const primaryColorForDarkScheme2 = primaryColorTuple?.[2] ?? "white";
    const primaryColorForDarkScheme1 = primaryColorTuple?.[1] ?? "white";
    const primaryColorForDarkScheme0 = primaryColorTuple?.[0] ?? "white";

    return {
        scheme: scheme,
        schemeAdjustedPrimaryColor:
            scheme === "dark" ? primaryColorForDarkScheme2 : primaryColorForLightScheme8,

        primaryColorForLightScheme9,
        primaryColorForLightScheme8,
        primaryColorForLightScheme7,
        primaryColorForLightScheme6,
        primaryColorForLightScheme5,
        primaryColorForLightScheme4,
        primaryColorForLightScheme3,
        primaryColorForLightScheme2,
        primaryColorForLightScheme1,
        primaryColorForLightScheme0,

        primaryColorForDarkScheme9,
        primaryColorForDarkScheme8,
        primaryColorForDarkScheme7,
        primaryColorForDarkScheme6,
        primaryColorForDarkScheme5,
        primaryColorForDarkScheme4,
        primaryColorForDarkScheme3,
        primaryColorForDarkScheme2,
        primaryColorForDarkScheme1,
        primaryColorForDarkScheme0,
    };
}
