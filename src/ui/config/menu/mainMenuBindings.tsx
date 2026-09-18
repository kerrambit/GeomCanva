/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { router } from "../../router/router";
import { AboutDialogueContent } from "../../features/about-dialogue/components/AboutDialogueContent";
import { useDialogueStore } from "../../stores/dialogueStore";
import {
    createAboutMenuItem,
    createAboutSection,
    createExitMenuItem,
    createExitSection,
    createFileRootMenuItem,
    createHelpRootMenuItem,
    createOnlyDevSection,
    createOpenDevToolsMenuItem,
} from "./systemMenuItems";
import {
    createCheckForUpdatesSection,
    createCheckForUpdatesMenuItem,
} from "./helpMenuItems";
import { createSettingsRootMenuItem } from "./settingsRootMenuItem";
import type { Menu } from "../../providers/MenuContext";

export function bindMainMenu(): Menu {
    return [
        createFileRootMenuItem([
            createOnlyDevSection("file-dev", "For developers", [
                createOpenDevToolsMenuItem(),
            ]),
            createExitSection([createExitMenuItem()]),
        ]),
        createSettingsRootMenuItem(() => {
            router.navigate("/settings");
        }),
        createHelpRootMenuItem([
            createCheckForUpdatesSection([createCheckForUpdatesMenuItem()]),
            createAboutSection([
                createAboutMenuItem(async () => {
                    await useDialogueStore.getState().showDialogue({
                        title: "About",
                        showCloseButton: true,
                        content: (close) => (
                            <AboutDialogueContent close={close} />
                        ),
                    });
                }),
            ]),
        ]),
    ];
}
