<script lang=ts>
	import { Window, type Process } from "@front-os/core";
	import { setContext } from "svelte";
	import Home from "./components/home.svelte";
	import Noting from "./components/noting.svelte";
	import Icon from "./components/icon.svelte";

    export let process: Process

    let noting = false;
    let noteId: number|undefined = undefined;

    setContext('process', process);
</script>

<Window {process} storageKey={process.app.key} className="h-full md:h-2/3">
    <div data-window-drag-blocker="true" class="relative max-w-screen w-screen md:max-w-2xl xl:max-w-4xl flex-1 overflow-hidden">
        {#if noting}
            <Noting on:close={() => {
                noting = false
                noteId = undefined
            }} id={noteId} />
        {:else}
            <Home 
                on:new:note={() => noting = true} 
                on:open:note={(evt) => {
                    noting = true
                    noteId = evt.detail.id
                }}
            />
        {/if}
    </div>
</Window>

<style>
    
</style>