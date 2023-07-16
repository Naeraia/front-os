<script lang=ts>
	import { Window, type Process } from "@front-os/core";
	import { onDestroy, setContext } from "svelte";
	import Home from "./components/home.svelte";
	import Noting from "./components/noting.svelte";
	import keymap, { NoteableCommands } from "./keymap";
	import { os } from "$lib";
    import Icon from "svelte-awesome";
    import {faTimes} from "@fortawesome/free-solid-svg-icons"
	import { Commands } from "$lib/os/keymap";

    export let process: Process

    let noting = false;
    let noteId: number|undefined = undefined;
    let keyMapModal: HTMLDialogElement;
    let showKeyMap: boolean = false;
    setContext('process', process);
    setContext('keymap', keymap);
    
    const destroyShowKeyMap = keymap.on(NoteableCommands.KeyMap, "noteable-show-keymap", () => {
        showKeyMap = true;

        if(keyMapModal) {
            keyMapModal.show();
        }
    })

    const destroyHideKeyMap = os.keymap.on(Commands.CANCEL, "noteable-show-keymap", () => {
        showKeyMap = false;

        if(keyMapModal) {
            keyMapModal.close();
        }

        return false;
    })

    onDestroy(() => {
        destroyShowKeyMap();
        destroyHideKeyMap();
    })
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
        <dialog bind:this={keyMapModal} class="modal modal-bottom sm:modal-middle">
            <form method="dialog" class="modal-box">
                <h3 class="font-bold text-lg mb-1 flex items-center">
                    <span class="flex-1">Notable Keys</span>
                    
                    <button type="submit" class="btn btn-sm btn-square btn-ghost">
                        <Icon data={faTimes} />
                    </button>
                </h3>
                <p class="mb-3">These keys are a noteworthy addition to your note taking journey.</p>
                <h4 class="font-bold mb-2">General</h4>
                <div class="grid grid-cols-3 mb-3">
                    <div>
                        <h5 class="text-sm mb-2">Close Dialog / Editor</h5>
                        <p class="kbd">Escape</p>
                    </div>
                    <div>
                        <h5 class="text-sm mb-2">Show Keybindings</h5>
                        <p>
                            <span class="kbd">Ctrl</span>
                            <span>+</span>
                            <span class="kbd">/</span>
                        </p>
                    </div>
                </div>
                <h4 class="font-bold mb-2">Notes</h4>
                <div class="grid grid-cols-3">
                    <div>
                        <h5 class="text-sm mb-2">New Note</h5>
                        <p class="kbd">N</p>
                    </div>
                    <div>
                        <h5 class="text-sm mb-2">Save Note</h5>
                        <p>
                            <span class="kbd">Ctrl</span>
                            <span>+</span>
                            <span class="kbd">S</span>
                        </p>
                    </div>
                    <div>
                        <h5 class="text-sm mb-2">Delete Note</h5>
                        <p class="kbd">Coming Soon</p>
                    </div>
                </div>
            </form>
        </dialog>
    </div>
</Window>

<style>
    
</style>