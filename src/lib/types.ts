export interface Position {
    x: number
    y: number
}

export type PointerType = 'mouse' | 'touch' | 'pen'
export type Arrayable<T> = T[] | T