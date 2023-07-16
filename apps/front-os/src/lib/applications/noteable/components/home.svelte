<script lang=ts>
	import { Icon } from "svelte-awesome";
    import { faNoteSticky, faPaintBrush } from "@fortawesome/free-solid-svg-icons"
	import { createEventDispatcher, getContext, onDestroy } from "svelte";
    import { liveQuery } from "dexie";
    import { type NoteableNote, noteableDb, deletedNote } from "../db";
    import { Svroller } from 'svrollbar'
    import { formatDistance } from 'date-fns'
	import { cubicOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import type { createKeyMap } from "@front-os/core/dist";
	import { NoteableCommands as NoteableCommands } from "../keymap";

    const dispatch = createEventDispatcher()

    $: notes = liveQuery<NoteableNote[]>(async () => {
        const notes = await noteableDb.notes
            .orderBy('updated')
            .reverse()
            .toArray()

        return notes;
    })

    let restore: (() => void)|undefined = undefined;

    const progress = tweened(1, {
		duration: 5000,
		easing: cubicOut
	});

    function newNote() {
        dispatch('new:note')
    }

    const keymap = getContext<ReturnType<typeof createKeyMap>>('keymap');

    const destroyNewNote = keymap.on(NoteableCommands.NewNote, "home-new-note", ({ event }) => {
        event.preventDefault();
        event.stopImmediatePropagation()
        event.stopPropagation();
        newNote();
        return false;
    })

    const destroyDeleteNote = deletedNote.subscribe(note => {
        if(note) {
            progress.set(1)
            
            restore = () => {
                noteableDb.notes.add(note, note.id);
                restore = undefined;
            }

            setTimeout(() => {
                deletedNote.set(undefined)
                restore = undefined;
                progress.set(0)
            }, 5000)
        }
    })

    onDestroy(() => {
        destroyNewNote()
        destroyDeleteNote()
    })
</script>
<div class="p-5 flex flex-col gap-5 bg-gradient-to-tr from-primary/20 h-full overflow-hidden">
    <h1 class="text-xl font-semibold flex items-center">
        <span class="flex-1">Welcome to Noteable</span>
        <span class="flex tooltip tooltip-left" data-tip="Show keybindings">
            <span class="kbd kbd-md">Ctrl</span>
            <span class="block mx-1 mt-0.5">+</span>
            <span class="kbd kbd-md">/</span>
        </span>
    </h1>
    {#if restore}
        <div class="alert relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>""</span>
            <button class="btn" on:click={restore}>
                Undo
            </button>
            <progress class="absolute bottom-0 left-0 progress h-1" value={Math.round($progress * 100)} max="100"></progress>
        </div>
    {/if}
    <div class="bg-base-200 bg-gradient-to-tr from-primary/20 rounded-md p-3 flex flex-col gap-3">
        <h2 class="text-lg font-medium">My next important moment is a...</h2>
        <div class="flex gap-3">
            <button on:click={newNote} class="btn h-auto p-6 flex flex-col gap-3 capitalize">
                <Icon data={faNoteSticky} scale={2} /> New Note
            </button>
            <button class="btn h-auto p-6 flex flex-col gap-3 capitalize" disabled>
                <Icon data={faPaintBrush} scale={2} /> New Drawing
            </button>
        </div>
    </div>
    <h2 class="text-lg font-medium">My Notes</h2>
    <div class="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div class="absolute top-0 left-0 opacity-50 pointer-events-none -z-10">
            <img src="/undraw_add_notes_re_ln36.svg" alt="No notes found" />
        </div>
        {#if $notes}
            <div class="flex-1 w-full overflow-hidden">
                <Svroller height="100%" width="100%">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {#each $notes as note (note.id) }
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div 
                            role="button" 
                            tabindex="0" 
                            on:click={() => dispatch('open:note', { id: note.id })} 
                            class="btn btn-block items-start text-left h-auto bg-base-200/95 p-3 rounded-md"
                        >
                            <div class="flex flex-col gap-1.5 flex-1 h-full normal-case relative overflow-hidden">
                                <h3 class="font-medium text-base">{note.title}</h3>
                                <p class="text-sm line-clamp-3 max-w-full flex-1">{note.content}</p>
                                <div class="divider mb-0 text-xs">{formatDistance(note.updated, new Date(), { addSuffix: true })}</div>
                            </div>
                        </div>
                        {/each}
                    </div>
                </Svroller>
            </div>
        {/if}
    </div>
</div>