import type { UseStorageOptions } from "@vueuse/core";
import useStorage from "./useStorage";

export function useSessionStorage<T = string | Record<string, unknown>>(key: string, defaults: T, options?: UseStorageOptions<string>) {
    return useStorage<T>(key, defaults, sessionStorage, options)
}