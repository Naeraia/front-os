<script lang="ts">
	import { Window, ApplicationType, type Process, type ApplicationBase } from "@front-os/core";
	import { onDestroy } from 'svelte';
	import { os } from "$lib";
	import { get } from "svelte/store";
	import TableRow from "./components/table-row.svelte";

	export let process: Process;

	let proceses: Process[] = [];

	let unsubscribe = os.processes.list.subscribe(list => {
		proceses = list.map(process => get(process))
	});

	onDestroy(() => {
		unsubscribe()
	})
</script>

<Window {process} storageKey={process.app.key}>
	<div class="overflow-x-auto w-full max-w-3xl">
		<table class="table table-xs table-pin-rows table-pin-cols">
		  <thead>
			<tr>
				<th>
					<label>
					<input type="checkbox" class="checkbox" />
					</label>
				</th>
			  	<th>App</th> 
				<th>Process ID</th> 
				<th>Duration</th> 
				<th>Start Time</th> 
			</tr>
		  </thead> 
		  <tbody>
			{#each proceses as process}
				<TableRow {process} />
			{/each}
		  </tbody>
		</table>
	  </div>
</Window>
