import type { PointerType, Position, Arrayable } from '$lib/types';
import { clamp, isClient } from '$lib/internal/utils/is';
import { toValue, type Func } from '$lib/internal/utils/values';
import type { Action } from 'svelte/action';
import { writable } from 'svelte/store';

export interface DraggableContext {
	isLocked: boolean;
	isDragging: boolean;
	position: Position;
	style: string;
}

export const emptyDragState: DraggableContext = {
	isLocked: false,
	isDragging: false,
	position: { x: 0, y: 0 },
	style: ''
};

export interface DraggableOptions {
	/**
	 * Only start the dragging when click on the element directly
	 *
	 * @default false
	 */
	exact?: boolean;

	/**
	 * A set of css selectors that can be declared to block drag 
	 *
	 * @default false
	 */
	blockers?: Arrayable<string>;

	/**
	 * A set of css selectors that can be declared to handle drag 
	 *
	 * @default false
	 */
	handles?: Arrayable<string>;

	/**
	 * Allow the draggable item to flow outside of it's bounding box
	 *
	 * @default true
	 */
	overflow?: boolean;

	/**
	 * Prevent events defaults
	 *
	 * @default false
	 */
	preventDefault?: boolean;

	/**
	 * Prevent events propagation
	 *
	 * @default false
	 */
	stopPropagation?: boolean;

	/**
	 * Whether dispatch events in capturing phase
	 *
	 * @default true
	 */
	capture?: boolean;

	/**
	 * Element to attach `pointermove` and `pointerup` events to.
	 *
	 * @default window
	 */
	draggingElement?: HTMLElement | SVGElement | Window | Document | null | undefined;

	/**
	 * Handle that triggers the drag event
	 *
	 * @default target
	 */
	handle?: HTMLElement | SVGElement | null | undefined;

	/**
	 * Pointer types that listen to.
	 *
	 * @default ['mouse', 'touch', 'pen']
	 */
	pointerTypes?: PointerType[];

	/**
	 * Initial position of the element.
	 *
	 * @default { x: 0, y: 0 }
	 */
	initialValue?: Position;

	/**
	 * Callback when the state updates.
	 */
	onUpdate?: (state: DraggableContext) => void | false;

	/**
	 * Callback when the dragging starts. Return `false` to prevent dragging.
	 */
	onStart?: (state: DraggableContext, event: PointerEvent) => void | false;

	/**
	 * Callback during dragging.
	 */
	onMove?: (state: DraggableContext, event: PointerEvent) => void;

	/**
	 * Callback when dragging end.
	 */
	onEnd?: (state: DraggableContext, event: PointerEvent) => void;

	/**
	 * Axis to drag on.
	 *
	 * @default 'both'
	 */
	axis?: 'x' | 'y' | 'both';

	/**
	 * Calculation mode.
	 *
	 * @default 'px'
	 */
	mode?: 'px' | '%';
}

function isDraggable(element: HTMLElement, blockers?: Arrayable<string>, handles?: Arrayable<string>): boolean {
	// If no blockers and handles are present we can always drag
	if(!(blockers && blockers.length) && !(handles && handles.length)) {
		return true;
	}

	// First we check for blockers
	if((blockers && blockers.length)) {
		// If a blocker is present we can't drag
		return !element.closest(Array.isArray(blockers) ? blockers.join(',') : blockers);
	}

	// Next we check for handles
	if((handles && handles.length) && element.closest(Array.isArray(handles) ? handles.join(',') : handles)) {
		return true;
	}

	// Not it's impossible to drag so we return false
	return false;
}

export function draggable(
	target:
		| HTMLElement
		| SVGElement
		| null
		| undefined
		| Func<HTMLElement | SVGElement | null | undefined>,
	options: DraggableOptions = {}
): ReturnType<
	Action<
		HTMLElement | SVGElement | null | undefined | Func<HTMLElement | SVGElement | null | undefined>,
		DraggableOptions
	>
> {
	let {
		blockers,
		mode,
		handles,
		pointerTypes,
		preventDefault,
		stopPropagation,
		exact,
		overflow = true,
		onUpdate,
		onMove,
		onEnd,
		onStart,
		initialValue,
		axis = 'both',
		draggingElement = window,
		handle: draggingHandle = target
	} = options;

	let startListening: (() => void) | undefined = undefined;
	let stopListening: (() => void) | undefined = undefined;

	const store = writable<DraggableContext>(
		{
			isLocked: false,
			isDragging: false,
			position: initialValue ?? { x: 0, y: 0 },
			style: ''
		},
		function start(set, update) {
			let deltaPosition: Position|undefined = undefined
			let boundary: DOMRect|undefined = undefined;
			let styles: CSSStyleDeclaration|undefined = undefined;

			function handleUpdate(callback: (state: DraggableContext) => Partial<DraggableContext> | void) {
				update((draggable) => {
					if (draggable.isLocked) return draggable;

					const updates = callback(draggable);

					if (!updates) return draggable;

					draggable = {
						...draggable,
						...updates,
						isDragging: !!deltaPosition
					};

					if(mode === '%') {
						const container = getContainerSize();
						const { width, height, left, top } = boundary ?? toValue(target)!.getBoundingClientRect();

						let [x, y] = [draggable.position.x, draggable.position.y]

						if(container.width && x) {
							x = clamp((x + width) / (container.width), 0, 1) * 100;
						}

						if(container.height && y) {
							y = clamp((y + height) / (container.height), 0, 1) * 100;
						}
						draggable.style = `left:${x ? `calc(${x}% - ${width}px)` : '0px'};top:${y ? `calc(${y}% - ${height}px)` : '0px'};`;
					} else {
						draggable.style = `left:${draggable.position.x}px;top:${draggable.position.y}px;`;
					}

					return draggable;
				});
			}

			const filterEvent = (e: PointerEvent) => {
				if (pointerTypes) return pointerTypes.includes(e.pointerType as PointerType);
				return true;
			};

			const handleEvent = (e: PointerEvent) => {
				if (toValue(preventDefault)) e.preventDefault();
				if (toValue(stopPropagation)) e.stopPropagation();
			};

			const start = (e: PointerEvent) => {
				if (!filterEvent(e)) return;
				if (toValue(exact) && e.target !== toValue(target)) return;

				if(!isDraggable(e.target as HTMLElement, blockers, handles)) {
					return;
				}

				handleUpdate((state) => {
					const rect = toValue(target)!.getBoundingClientRect();

					const position = {
						x: e.clientX - rect.left,
						y: e.clientY - rect.top
					};

					if (onStart?.({...state, position}, e) === false) return;

					handleEvent(e);

					deltaPosition = position
					boundary = rect
					styles = getComputedStyle(toValue(target) as HTMLElement)
					return;
				});
			}

			const move = (e: PointerEvent) => {
				if (!filterEvent(e)) return;

				handleUpdate((state) => {
					if (!deltaPosition) return;

					let { x, y } = state.position;
					if (axis === 'x' || axis === 'both') 
						x = e.clientX - deltaPosition.x;
					if (axis === 'y' || axis === 'both') 
						y = e.clientY - deltaPosition.y;

					if(!overflow && boundary) {
						state.position = clipToBoundary(x, y, boundary as DOMRect);
					} else {
						state.position = { x, y };
					}
					
					onMove?.(state, e);
					handleEvent(e);
					return state;
				})
			};

			const end = (e: PointerEvent) => {
				if (!filterEvent(e)) return;
				if (!deltaPosition) return;
				
				handleUpdate((state) => {
					deltaPosition = undefined;
					styles = undefined;
					boundary = undefined;
					onEnd?.(state, e);
					handleEvent(e);
					return state;
				});
			}

			function getWidth() {
				if(draggingElement instanceof Window) {
					return draggingElement.innerWidth
				} else if(draggingElement instanceof Document) {
					return draggingElement.documentElement.clientWidth;
				} else if(draggingElement instanceof Element) {
					return draggingElement.getBoundingClientRect().width;
				}

				return 0;
			}

			function getHeight() {
				if(draggingElement instanceof Window) {
					return draggingElement.innerHeight
				} else if(draggingElement instanceof Document) {
					return draggingElement.documentElement.clientHeight;
				} else if(draggingElement instanceof Element) {
					return draggingElement.getBoundingClientRect().height;
				}

				return 0;
			}

			function getContainerSize(): { width: number, height: number }
			{
				let [width, height] = [0, 0];

				
				if(draggingElement instanceof Window) {
					[width, height] = [draggingElement.innerWidth,draggingElement.innerHeight]
				} else if(draggingElement instanceof Document) {
					[width, height] = [draggingElement.documentElement.clientWidth,draggingElement.documentElement.clientHeight];
				} else if(draggingElement instanceof Element) {
					const rect = draggingElement.getBoundingClientRect();
					[width, height] = [rect.width, rect.height];
				}
				
				return {
					width,
					height
				}
			}

			function clipToBoundary(x: number, y: number, boundary: DOMRect): Position {
				if(draggingElement instanceof Window || draggingElement instanceof Document) {
					if(x < 0) {
						x = 0;
					}
			
					if(y < 0) {
						y = 0;
					}
			
					if(draggingElement instanceof Window) {
						if(x + boundary.width > draggingElement.innerWidth) {
							x = draggingElement.innerWidth - boundary.width
						}
			
						if(y + boundary.height > draggingElement.innerHeight) {
							y = draggingElement.innerHeight - boundary.height
						}
					} else {
						if(x + boundary.width > draggingElement.documentElement.clientWidth) {
							x = draggingElement.documentElement.clientWidth - boundary.width
						}
			
						if(y + boundary.height > draggingElement.documentElement.clientHeight) {
							y = draggingElement.documentElement.clientHeight - boundary.height
						}
					} 
				} else if(draggingElement instanceof HTMLElement) {
					const rect = draggingElement.getBoundingClientRect();
			
					if(styles?.position === 'fixed') {
						if(x < rect.left) {
							x = rect.left;
						} else if(x > rect.left + rect.width - boundary.width) {
							x = rect.left + rect.width - boundary.width;
						}
			
						if(y < rect.top) {
							y = rect.top;
						} else if(y > rect.top + rect.height - boundary.height) {
							y = rect.top + rect.height - boundary.height;
						}
					} else {
						x -= rect.left;
						y -= rect.top;
						if(x < 0) {
							x = 0;
						} else if(x > rect.width - boundary.width) {
							x = rect.width - boundary.width;
						}
			
						if(y < 0) {
							y = 0;
						} else if(y > rect.height - boundary.height) {
							y = rect.height - boundary.height;
						}
					}
				}
			
				return { x, y }
			}
			

			startListening = () => {
				if (isClient) {
					const config = { capture: options.capture ?? true };
					(draggingHandle as HTMLElement).addEventListener('pointerdown', start, config);
					(draggingElement as HTMLElement).addEventListener('pointermove', move, config);
					(draggingElement as HTMLElement).addEventListener('pointerup', end, config);
				}
			};

			stopListening = () => {
				if (isClient) {
					const config = { capture: options.capture ?? true };
					(draggingHandle as HTMLElement).removeEventListener('pointerdown', start, config);
					(draggingElement as HTMLElement).removeEventListener('pointermove', move, config);
					(draggingElement as HTMLElement).removeEventListener('pointerup', end, config);
				}
			};

			startListening();

			return function stop() {
				stopListening?.();
			};
		}
	);

	const unsubscribe = store.subscribe(function update(state) {
		onUpdate?.(state);
	});

	return {
		update(params) {
			stopListening?.();
				mode = params.mode ?? mode,
				blockers = params.blockers ?? blockers,
				handles = params.handles ?? handles,
				overflow = params.overflow ?? overflow,
				pointerTypes = params.pointerTypes ?? pointerTypes,
				preventDefault = params.preventDefault ?? preventDefault,
				stopPropagation = params.stopPropagation ?? stopPropagation,
				exact = params.exact ?? exact,
				onUpdate = params.onUpdate ?? onUpdate,
				onMove = params.onMove ?? onMove,
				onEnd = params.onEnd ?? onEnd,
				onStart = params.onStart ?? onStart,
				initialValue = params.initialValue ?? initialValue,
				axis = params.axis ?? axis ?? 'both',
				draggingElement = params.draggingElement ?? draggingElement ?? window,
				draggingHandle = params.handle ?? draggingHandle ?? target;
			startListening?.();
		},
		destroy() {
			unsubscribe();
		}
	};
}
