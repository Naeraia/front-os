<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import {
		faChevronLeft,
		faSave,
		faEdit,
		faClock,
		faTrash
	} from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher, onDestroy, onMount, setContext } from 'svelte';
	import { deletedNote, noteableDb, type NoteableNote } from '../db';
	import { Svroller } from 'svrollbar';
	import autosize from 'svelte-autosize';
	import { formatRelative } from 'date-fns';
	import { keymap } from "$lib/commands";

	enum SaveStatus {
		NONE,
		OK,
		FAILED
	}

	export let id: number | undefined = undefined;

	let note: NoteableNote = {
		id: undefined,
		title: 'My Note',
		content: '',
		created: new Date(),
		updated: new Date()
	};

	let loading = true;
	let editing = !note.id;
	let deleteModal: HTMLDialogElement;

	onMount(() => {
		if (id === undefined) {
			loading = false;
		}
	});

	$: if (id && !note.id) {
		loading = true;
		noteableDb.notes
			.get(id)
			.then((item) => {
				note = item ?? note;
			})
			.finally(() => {
				loading = false;
			});
	}

	const dispatch = createEventDispatcher();

	let status: SaveStatus = SaveStatus.NONE;
	let saving: boolean = false;
	async function save() {
		saving = true;
		try {
			if (note.id || id) {
				note.updated = new Date();
				const updated = await noteableDb.notes.update(id ?? note.id, note);

				status = updated ? SaveStatus.OK : SaveStatus.FAILED;
			} else {
				const id = await noteableDb.notes.add(note, note.id);
				note.id = id;
				status = SaveStatus.OK;
			}

			console.log(note, status);
		} catch (e) {
			status = SaveStatus.FAILED;
		} finally {
			saving = false;
			editing = false;
		}
	}

	function close() {
		dispatch('close');
	}

	let deleting = false;

	async function deleteNote() {
		deleting = true;
		await noteableDb.notes.delete(id);
		deleting = false;
		deleteModal.close();
        deletedNote.set(note)
		dispatch('close');
	}

    const off = keymap.on("commands.cancel", "noteable-note-edit", () => {
        dispatch('close')
    })

    onDestroy(() => {
        off()
    })
</script>

<div class="p-5 flex flex-col gap-5 h-full overflow-hidden">
	{#if loading}
		<div class="flex items-center justify-center w-full flex-1">
			<span class="loading loading-bars loading-lg" />
		</div>
	{:else}
		<div class="flex gap-3">
			<button class="btn btn-square btn-ghost" on:click={close}>
				<Icon data={faChevronLeft} />
			</button>
			<input
				type="text"
				bind:value={note.title}
				class="input flex-1 disabled:cursor-text"
				disabled={saving || !editing}
			/>
			<button
				class="btn btn-square btn-ghost"
				on:click={() => (editing ? save() : (editing = true))}
				disabled={saving}
			>
				{#if saving}
					<span class="loading loading-spinner loading-sm" />
				{:else}
					<Icon data={editing ? faSave : faEdit} />
				{/if}
			</button>
		</div>
		<div class="relative flex-1 overflow-hidden bg-base-200 rounded-md">
			<Svroller width="100%" height="100%">
				<textarea
					use:autosize
					class="textarea bg-base-200 rounded-md w-full min-h-full p-5 focus:outline-none disabled:cursor-text"
					bind:value={note.content}
					disabled={saving || !editing}
				/>
			</Svroller>
		</div>
		<ul class="flex bg-base-200 rounded-md gap-1.5 p-1 z-10">
			<li class="flex items-center">
				<label class="swap swap-flip">
					<!-- this hidden checkbox controls the state -->
					<input type="checkbox" />

					<div class="flex items-center px-3 text-sm gap-3 swap-on tooltip" data-tip={`Created`}>
						<Icon data={faClock} />{formatRelative(note.created, new Date())}
					</div>
					<div
						class="flex items-center px-3 text-sm gap-3 swap-off tooltip"
						data-tip={`Last updated`}
					>
						<Icon data={faClock} />{formatRelative(note.updated, new Date())}
					</div>
				</label>
			</li>
			<li class="flex-1 flex justify-end">
				<button
					on:click={() => deleteModal.showModal()}
					class="btn btn-sm btn-square btn-ghost h-9 w-9 tooltip"
					data-tip="Delete"
				>
					<Icon data={faTrash} />
				</button>
				<dialog bind:this={deleteModal} class="modal modal-bottom sm:modal-middle">
					<form method="dialog" class="modal-box">
						<h3 class="font-bold text-lg">Confirm Deletion</h3>
						<p class="py-4">
							Woah hold up, are you sure you want to delete this fantastic note? We can talk about
							this... 😭 How about a compromise? You delete the contents and use this note anew!
						</p>
						<div class="modal-action">
							<button type="submit" class="btn">Okay Fine... it stays</button>
							<button type="button" class="btn btn-error" on:click={deleteNote}
								>I'm sure {#if deleting}<span
										class="loading loading-spinner loading-sm"
									/>{:else}<Icon data={faTrash} />{/if}</button
							>
						</div>
					</form>
				</dialog>
			</li>
		</ul>
	{/if}
</div>
