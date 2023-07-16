import type { Process } from "$lib/stores/processes"
import type { DefaultProps } from "$lib/types"

export interface WindowProps extends DefaultProps {
    process: Process
    withTitle: boolean
    draggingElement: HTMLElement | Document | Window | undefined | string 
    canDrag: boolean   
}