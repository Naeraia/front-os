import type { DefaultProps } from "$lib/types"

import type { DraggableOptions, DraggableContext } from "$lib/use/draggable"

export interface DraggableProps extends DefaultProps {
    auto: boolean
    exact: DraggableOptions["exact"]|undefined
    blockers: DraggableOptions["blockers"]|undefined
    handles: DraggableOptions["handles"]|undefined
    overflow: DraggableOptions["overflow"]|undefined
    preventDefault: DraggableOptions["preventDefault"]|undefined
    stopPropagation: DraggableOptions["stopPropagation"]|undefined
    capture: DraggableOptions["capture"]|undefined
    draggingElement: DraggableOptions["draggingElement"]|undefined
    handle: DraggableOptions["handle"]|undefined
    pointerTypes: DraggableOptions["pointerTypes"]|undefined
    initialValue: DraggableOptions["initialValue"]|undefined
    axis: DraggableOptions["axis"]|undefined
}

interface DraggablePointerEvent {
    state: DraggableContext, 
    event: PointerEvent
}

export interface DraggableEvents {
    update: CustomEvent<DraggableContext>
    start: CustomEvent<DraggablePointerEvent>
    move: CustomEvent<DraggablePointerEvent>
    end: CustomEvent<DraggablePointerEvent>
}