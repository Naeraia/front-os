import { move as useMove } from '@svelteuidev/composables/*';
import type { Position } from "$lib/types";

export interface MoveOptions {
	parent: HTMLElement | Document;
	position: Position;
}

export function windowMove(target: HTMLElement, options?: MoveOptions) {
	const context: MoveOptions = {
		parent: document.body,
		position: {
			x: 0,
			y: 0
		},
		...(options ?? {})
	};

	const move = useMove(context.parent as HTMLElement);

	function handleEvent(event: Event) {
		target.dispatchEvent(event as CustomEvent<Position>);
	}

	context.parent.addEventListener('move:start', handleEvent);
	context.parent.addEventListener('move', handleEvent);
	context.parent.addEventListener('move:stop', handleEvent);

	const destroy = move.destroy;

	move.destroy = () => {
		context.parent.removeEventListener('move:start', handleEvent);
		context.parent.removeEventListener('move', handleEvent);
		context.parent.removeEventListener('move:stop', handleEvent);

		if (destroy) {
			destroy();
		}
	};

	return move;
}
