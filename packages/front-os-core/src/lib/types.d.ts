export interface Position {
    x: number
    y: number
}

export type SvelteActionReturnType<P> = {
	update?: (newParams?: P) => void;
	destroy?: () => void;
} | void;

export interface SvelteAction<E = HTMLElement, P = unknown> {
	<N extends E>(node: N, params?: P): void | SvelteActionReturnType<P>;
}

export type ActionEntry<N = HTMLElement, P = unknown> = SvelteAction<N, P> | [SvelteAction<N, P>, P];

export type ActionArray = ActionEntry[]

export interface DefaultProps<T = HTMLElement> {
	className?: string;
	element?: T;
	use?: ActionArray;
}

export type PointerType = 'mouse' | 'touch' | 'pen'
export type Arrayable<T> = T[] | T