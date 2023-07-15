export type Func<T = unknown> = () => T

export function toValue<T = unknown>(functionOrValue: Func<T> | T): T {
    return typeof functionOrValue === "function" ? (functionOrValue as Func<T>)() : functionOrValue
}