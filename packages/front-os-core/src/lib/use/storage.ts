import { useStorage as iUseStorage, type StorageLike, type UseStorageOptions } from "@vueuse/core";
import { writable } from "svelte/store";

export default function useStorage<T = string | Record<string, unknown>>(key: string, defaults: T, storage?: StorageLike, options?: UseStorageOptions<string>) {
    const state = iUseStorage(key, defaults as string, storage, options);
    const store = writable<T>(state.value as T)

    store.subscribe((to) => {
        state.value = to as string;
    })

    return store
}