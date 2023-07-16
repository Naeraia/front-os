<script lang=ts>
	import Window from "$lib/components/window.svelte";
	import type { Process } from "$lib/stores/os/processes";
    import { evaluate, isOperatorNode } from "mathjs";

    export let process: Process

    const operators = ['%',':','*','-','+']

    let chain: (string|number)[] = [];

    function last() {
        return chain[chain.length - 1];
    }

    function addNumber(number: number) {
        chain = [...chain, number];
    }

    function addOperator(operator: string) {
        if(Number.isInteger(last()))
            chain = [...chain, operator];
    }

    function addDecimal() {
        if(Number.isInteger(last()))
            chain = [...chain, '.'];
    }   

    function calculate() {
        chain = [evaluate(chain.join(''))];
    }

    function clear() {
        chain = [];
    }

    $: display = chain.map(item => {
        if(operators.includes(item))
            return ` ${item} `;
        return item;
    }).join('');
</script>

<Window {process} storageKey={process.app.key}>
    <div data-window-drag-blocker="true" class="relative bg-gradient-to-tr from-secondary/25 p-5 flex flex-col gap-5">
        <div class="bg-base-200 bg-gradient-to-tr from-secondary/20 rounded-md p-3 text-right">
            {display.length ? display : '0'}
        </div>
        <div class="grid grid-cols-4 overflow-hidden bg-base-200/60 rounded-md">
            <button on:click={clear} class="btn btn-square btn-ghost rounded-none">AC</button>
            <button class="btn btn-square btn-ghost rounded-none">+/-</button>
            <button on:click={() => addOperator('%')} class="btn btn-square btn-ghost rounded-none">%</button>
            <button on:click={() => addOperator('/')} class="btn btn-square btn-ghost rounded-none">/</button>
            <button on:click={() => addNumber(7)}  class="btn btn-square btn-ghost rounded-none">7</button>
            <button on:click={() => addNumber(8)}  class="btn btn-square btn-ghost rounded-none">8</button>
            <button on:click={() => addNumber(9)}  class="btn btn-square btn-ghost rounded-none">9</button>
            <button on:click={() => addOperator('*')} class="btn btn-square btn-ghost rounded-none">x</button>
            <button on:click={() => addNumber(4)}  class="btn btn-square btn-ghost rounded-none">4</button>
            <button on:click={() => addNumber(5)}  class="btn btn-square btn-ghost rounded-none">5</button>
            <button on:click={() => addNumber(6)}  class="btn btn-square btn-ghost rounded-none">6</button>
            <button on:click={() => addOperator('-')} class="btn btn-square btn-ghost rounded-none">-</button>
            <button on:click={() => addNumber(1)}  class="btn btn-square btn-ghost rounded-none">1</button>
            <button on:click={() => addNumber(2)}  class="btn btn-square btn-ghost rounded-none">2</button>
            <button on:click={() => addNumber(3)}  class="btn btn-square btn-ghost rounded-none">3</button>
            <button on:click={() => addOperator('+')} class="btn btn-square btn-ghost rounded-none">+</button>
            <button on:click={() => addNumber(0)} class="btn btn-square btn-ghost col-span-2 w-full rounded-none">0</button>
            <button on:click={() => addDecimal()} class="btn btn-square btn-ghost rounded-none">.</button>
            <button on:click={calculate} class="btn btn-square btn-ghost rounded-none">=</button>
        </div>
    </div>
</Window>