/**
 * Copyright (c) 2026-now GeomCanva contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";

export function useEnvironment() {
    const [env] = useState<Environment>(window.electron.requestEnvironment());

    return env;
}
