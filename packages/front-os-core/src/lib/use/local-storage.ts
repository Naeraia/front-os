import type { UseStorageOptions } from "@vueuse/core";
import useStorage from "./storage";

export function useLocalStorage<T = string | Record<string, unknown>>(key: string, defaults: T, options?: UseStorageOptions<string>) {
    return useStorage<T>(key, defaults, localStorage, options)
}