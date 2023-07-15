import { ApplicationType, type ApplicationBase } from "$lib/stores/os/processes";
import Component from './component.svelte'

const noteable: ApplicationBase = {
    key: "system.noteable",
    name: "Noteable",
    description: "A notepad you'll remember",
    icon: "/fontawesome/fad/notes.svg",
    type: ApplicationType.APPLICATION,
    location: "system",
    components: {
        window: Component
    },
};

export default noteable;