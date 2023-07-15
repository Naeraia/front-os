import { ApplicationType, type ApplicationBase } from "$lib/stores/os/processes";
import Component from './component.svelte'
const settings: ApplicationBase = {
    key: "system.settings",
    name: "Settings",
    description: "FrontOS Settings",
    icon: "/fontawesome/far/gear.svg",
    type: ApplicationType.APPLICATION,
    location: "system",
    components: {
        window: Component
    },
};

export default settings;