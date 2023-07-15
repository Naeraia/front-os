<script lang=ts>
	import { type DraggableOptions, draggable, type Draggable } from "$lib/use/draggable";
	import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher()

    export let auto: boolean = true
    export let exact: DraggableOptions["exact"]|undefined = undefined;
    export let blockers: DraggableOptions["blockers"]|undefined = undefined;
    export let handles: DraggableOptions["handles"]|undefined = undefined;
    export let overflow: DraggableOptions["overflow"]|undefined = undefined;
    export let preventDefault: DraggableOptions["preventDefault"]|undefined = undefined;
    export let stopPropagation: DraggableOptions["stopPropagation"]|undefined = undefined;
    export let capture: DraggableOptions["capture"]|undefined = undefined;
    export let draggingElement: DraggableOptions["draggingElement"]|undefined = undefined;
    export let handle: DraggableOptions["handle"]|undefined = undefined;
    export let pointerTypes: DraggableOptions["pointerTypes"]|undefined = undefined;
    export let initialValue: DraggableOptions["initialValue"]|undefined = undefined;
    export let axis: DraggableOptions["axis"]|undefined = undefined;

    let style: string|undefined = undefined

    function onUpdate(state: Draggable) {
        if(!dispatch("update", state, { cancelable: true })) {
            return false;
        }

        style = auto ? state.style : undefined;
    }

    function onStart(state: Draggable, event: PointerEvent) {
        if(!dispatch("update", {state, event}, { cancelable: true }))
            return false;
    }

    function onMove(state: Draggable, event: PointerEvent) {
        dispatch("update", {state, event})
    }

    function onEnd(state: Draggable, event: PointerEvent) {
        dispatch("update", {state, event})
    }

    $: props = {
        exact,
        blockers,
        handles,
        overflow,
        preventDefault,
        stopPropagation,
        capture,
        draggingElement,
        handle,
        pointerTypes,
        initialValue,
        axis,
        onUpdate: onUpdate,
        onStart: onStart,
        onMove: onMove,
        onEnd: onEnd,
    }
</script>

<div {...$$restProps} use:draggable={props} {style}>
    <slot />
</div>