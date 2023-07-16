<script lang=ts>
	import { draggable, emptyDragState, type DraggableContext } from "$lib/use/draggable";
    import { Icon } from "svelte-awesome"
    import { faTimes } from "@fortawesome/free-solid-svg-icons"
	import type { WindowProps as $$WindowProps } from "./window";

    interface $$Props extends $$WindowProps {}
    
    export let process: $$Props["process"],
        className: $$Props["className"] = "",
        draggingElement: $$Props["draggingElement"] = '[data-window-container="true"]',
        canDrag: $$Props["canDrag"] = true,
        withTitle: $$Props["withTitle"] = true;

    let self: HTMLDivElement
    let dragState: DraggableContext = emptyDragState;

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
    {#if withTitle}
    <div data-window-drag-handle="true" class="window-title">
        {#if $$slots.title}
            <slot name="title" />
        {:else}
            {#if $$slots['title-icon']}
                <slot name="title-icon" />
            {:else if process.app.icon}
                <img src={process.app.icon} alt={process.app.name} class="window-title-icon" />
            {/if}
            <div class="window-title-appname">
                {#if $$slots['title-text']}
                    <slot name="title-text" />
                {:else}
                    {process.app.name}
                {/if}
            </div>
            <div class="title-button-group">
                {#if $$slots['title-buttons']}
                    <slot name="title-buttons" />
                {:else}
                    <button data-window-drag-blocker="true" class="window-title-btn" on:click={() => process.exit()}>
                        <Icon data={faTimes} />
                    </button>
                {/if}
            </div>
        {/if}
    </div>
    {/if}
    
    <slot />
</div>