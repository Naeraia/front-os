import { createKeyMap, createProcessManager, time as defaultTime } from "@front-os/core"
import { keymap as defaultKeyMap } from "./keymap";

export const processes = createProcessManager();
export const time = defaultTime
export const keymap = createKeyMap(() => window, defaultKeyMap)