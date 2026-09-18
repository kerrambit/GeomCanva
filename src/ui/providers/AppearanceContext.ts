/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { createContext } from "react";
import type { ThemeType } from "../config/themes";

type AppearanceContextType = {
    setColorTheme: (theme: ThemeType) => void;
    availableColorThemes: ThemeType[];
    niceColorThemeNames: Record<ThemeType, string>;
};

export const AppearanceContext = createContext<
    AppearanceContextType | undefined
>(undefined);
