<script lang=ts>
	import { draggable, type DraggableContext } from "$lib/use/draggable";
	import { createEventDispatcher } from "svelte";
    import type { 
        DraggableProps as $$DraggableProps,
        DraggableEvents as $$DraggableEvents
    } from "./draggable"

    interface $$Props extends $$DraggableProps {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface $$Events extends $$DraggableEvents {}

    export let auto: $$Props["auto"] = true,
        exact: $$Props["exact"]|undefined = undefined,
        blockers: $$Props["blockers"]|undefined = undefined,
        handles: $$Props["handles"]|undefined = undefined,
        overflow: $$Props["overflow"]|undefined = undefined,
        preventDefault: $$Props["preventDefault"]|undefined = undefined,
        stopPropagation: $$Props["stopPropagation"]|undefined = undefined,
        capture: $$Props["capture"]|undefined = undefined,
        draggingElement: $$Props["draggingElement"]|undefined = undefined,
        handle: $$Props["handle"]|undefined = undefined,
        pointerTypes: $$Props["pointerTypes"]|undefined = undefined,
        initialValue: $$Props["initialValue"]|undefined = undefined,
        axis: $$Props["axis"]|undefined = undefined;

    const dispatch = createEventDispatcher()

    let style: string|undefined = undefined

    function onUpdate(state: DraggableContext) {
        if(!dispatch("update", state, { cancelable: true })) {
            return false;
        }

        style = auto ? state.style : undefined;
    }

    function onStart(state: DraggableContext, event: PointerEvent) {
        if(!dispatch("start", {state, event}, { cancelable: true }))
            return false;
    }

    function onMove(state: DraggableContext, event: PointerEvent) {
        dispatch("move", {state, event})
    }

    function onEnd(state: DraggableContext, event: PointerEvent) {
        dispatch("end", {state, event})
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