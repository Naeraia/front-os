import { ApplicationType, type ApplicationBase } from "@front-os/core";
import Component from './component.svelte'

const calculator: ApplicationBase = {
    key: "system.calculator",
    name: "Calculator",
    description: "a simple calculator demo",
    icon: "/fontawesome/fal/calculator.svg",
    type: ApplicationType.APPLICATION,
    location: "system",
    components: {
        window: Component
    },
};

export default calculator;