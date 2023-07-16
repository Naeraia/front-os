<script lang=ts>
	import Window from "$lib/components/window.svelte";
	import type { Process } from "$lib/stores/os/processes";

    export let process: Process

</script>

<Window {process} storageKey={process.app.key}>
    <div data-window-drag-blocker="true" class="relative p-5">
        Still cooking the spaghetti.
    </div>
</Window>