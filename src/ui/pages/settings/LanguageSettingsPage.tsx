/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { BaseSettings } from "../../features/settings/components/BaseSettings";
import { LanguageSettingsForm } from "../../features/settings/components/LanguageSettingsForm";

export default function LanguageSettingsPage() {
    return (
        <BaseSettings>
            <LanguageSettingsForm />
        </BaseSettings>
    );
}
