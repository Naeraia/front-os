<script lang=ts>
	import type { Process } from "@front-os/core/dist";
	import { onDestroy, onMount } from "svelte";
    import { intervalToDuration, format, formatDuration } from "date-fns"
    export let process: Process;

    let duration: string = 0;
    
    let interval = setInterval(() => {
        duration = formatDuration(intervalToDuration({
            start: process.time.created, 
            end: new Date
        }))
    }, 1000);

    onDestroy(() => {
        clearInterval(interval)
    })
</script>
<tr class="text-left" data-tip={process.app.description}>
    <td>
      <label>
        <input type="checkbox" class="checkbox" />
      </label>
    </td>
    <td class="whitespace-nowrap">{process.app.name}</td> 
    <td class="whitespace-nowrap">{process.pid}</td> 
    <td class="whitespace-nowrap">{duration}</td>
    <td class="whitespace-nowrap">{format(process.time.created, "Y-m-d H:i:s")}</td>
</tr>