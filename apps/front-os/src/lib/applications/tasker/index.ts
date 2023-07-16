import { ApplicationType, type ApplicationBase } from "@front-os/core";
import Component from './component.svelte'

const tasker: ApplicationBase = {
    key: "system.tasker",
    name: "Tasker",
    description: "Tasker",
    icon: "/assets/icons/tasker.svg",
    type: ApplicationType.APPLICATION,
    location: "system",
    components: {
        window: Component
    },
};

export default tasker;