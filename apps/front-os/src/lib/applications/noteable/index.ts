import { ApplicationType, type ApplicationBase } from "@front-os/core";
import Component from './component.svelte'

const noteable: ApplicationBase = {
    key: "system.noteable",
    name: "Noteable",
    description: "A notepad you'll remember",
    icon: "/assets/icons/noteable.svg",
    type: ApplicationType.APPLICATION,
    location: "system",
    components: {
        window: Component
    },
};

export default noteable;