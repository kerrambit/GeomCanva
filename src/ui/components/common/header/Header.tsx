/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Menu } from "../menu/Menu";
import { TopBar } from "../topbar/TopBar";

import "./Header.css";

export function Header() {
    return (
        <TopBar>
            <Menu></Menu>
        </TopBar>
    );
}
