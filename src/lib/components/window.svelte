<script lang=ts>
	import type { Process } from "$lib/stores/os/processes";
    import useStorage from "$lib/use/useStorage";
	import type { Position } from "$lib/types";
	import { draggable, emptyDragState, type Draggable } from "$lib/use/draggable";
    import { Icon } from "svelte-awesome"
    import { faTimes } from "@fortawesome/free-solid-svg-icons"
    
    export const ssr = false;

    export let storageKey: string|undefined = undefined
    export let process: Process
    export let className: string = ""
    export let storageType: 'session' | 'local' = 'session'
    export let draggingElement: HTMLElement | Document | Window | undefined | string = '[data-window-container="true"]';
    export let canDrag: boolean = true;

    interface WindowConfig {
        width: number | string | 'auto' | 'initial' | 'revert'
        height: number | string | 'auto' | 'initial' | 'revert'
        position: Position
    }

    let self: HTMLDivElement
    let dragState: Draggable = emptyDragState;

    $: storage = storageKey ? useStorage(storageKey, {}, storageType === 'local' ? localStorage : sessionStorage) : undefined
    $: parent = (typeof draggingElement === 'string' ? (self ? self.closest(draggingElement) : undefined) : draggingElement) as HTMLElement | Document | Window | undefined;
</script>
<div
    bind:this={self}
    id={process.pid}
    use:draggable={{
        draggingElement: parent,
        overflow: false,
        mode: '%',
        handles: ['[data-window-drag-handle="true"]'],
        blockers: [`[data-window-drag-blocker="true"]`],
        onStart: () => {
            if(!canDrag) {
                return false;
            }
        },
        onUpdate: state => {
            dragState = state
        },
    }}
    class={`window ${className}`}
    style={dragState.style}
    {...$$restProps}
>
    <div data-window-drag-handle="true" class="window-title">
        {#if process.app.icon}
            <img src={process.app.icon} alt={process.app.name} class="window-title-icon" />
        {/if}
        <span class="flex-1 text-left ml-3">{process.app.name}</span>
        <button data-window-drag-blocker="true" class="btn btn-square btn-xs mr-2" on:click={() => process.exit()}>
            <Icon data={faTimes} />
        </button>
    </div>
    <slot />
</div>

<style lang="postcss">
    .window {
        @apply absolute bg-base-300 rounded-lg overflow-hidden shadow-md flex flex-col;
    }

    .window-title {
        @apply relative bg-base-200 text-sm w-full py-2 tooltip flex items-center;
    }

    .window-title-icon {
        @apply pointer-events-none h-full w-auto ml-3;
    }
</style>