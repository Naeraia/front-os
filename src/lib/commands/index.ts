import { get, writable, type Unsubscriber } from "svelte/store";
import {Commands as CommandType, keymap as defaultKeyMap} from "./keymap";
import { getModifierState, match, parseKeybinding } from "$lib/vendor/tinykeys";

type KeyBindingPress = [string[], string];

export type KeyBindingIdentifier = string | CommandType
export type KeyBindingSequence = string
export interface KeyBindingTriggerContext {
    name: string
    keybinding: {
        identifier: string 
        name: string
        keybindings: KeyBindingSequence[] 
    }, 
    trigger: KeyBindingPress[],
    event: KeyboardEvent 
}
export type KeyBindingTrigger = (context: KeyBindingTriggerContext) => void|false

export type KeyBindingSubscriber = [string, KeyBindingTrigger]

export interface KeyBinding {
    name: string;
    timeout?: number;
    keybindings: KeyBindingSequence[];
    subscribers?: KeyBindingSubscriber[]
}

export type KeyMap = Record<KeyBindingIdentifier, KeyBinding>

export interface KeyBindingListeners {
    [identifier: KeyBindingIdentifier]: KeyBindingSubscriber[] 
}

interface InternalContext {
    timeout: number,
    keymap: KeyMap,
    subscribers: KeyBindingListeners
}

export function createKeyMap(target: () => Window | HTMLElement, keymap: KeyMap, timeout = 1000) {
    const subscribers: KeyBindingListeners = {};

    for(const key of Object.keys(keymap)) {
        subscribers[key as KeyBindingIdentifier] = []
    }

    const context = writable<InternalContext>({
        timeout,
        keymap,
        subscribers
    })

    function on(identifier: keyof typeof keymap, subscriber: string, callback: KeyBindingTrigger) {
        let index = -1;

        context.update(function (context) {
            
            if(context.subscribers[identifier]) {
                index = context.subscribers[identifier].push([subscriber,callback])
            }

            return context;
        })

        return function off() {
            if(index >= 0) {
                context.update(function (context) {
                    context.subscribers[identifier];

                    return context;
                })
            }
        }
    }

    function createEventListener(context: InternalContext): EventListener {
        const timeout = context.timeout;
        const keyBindings: [KeyBindingPress[], KeyBindingIdentifier][] = [];

        Object.keys(context.keymap).forEach(identifier => {
            for (const key of keymap[identifier].keybindings) {
                keyBindings.push([parseKeybinding(key), identifier])
            }
        })

    	const possibleMatches = new Map<KeyBindingPress[], KeyBindingPress[]>();
	    let timer: NodeJS.Timer | number | null = null;
        return (event) => {
            if (!(event instanceof KeyboardEvent)) {
                return;
            }

            keyBindings.forEach((keyBinding) => {
                const sequence = keyBinding[0];
                const identifier = keyBinding[1];
    
                const prev = possibleMatches.get(sequence);
                const remainingExpectedPresses = prev ? prev : sequence;
                const currentExpectedPress = remainingExpectedPresses[0];
    
                const matches = match(event, currentExpectedPress);
                
                if (!matches) {
                    if (!getModifierState(event, event.key)) {
                        possibleMatches.delete(sequence);
                    }
                } else if (remainingExpectedPresses.length > 1) {
                    possibleMatches.set(sequence, remainingExpectedPresses.slice(1));
                } else {
                    possibleMatches.delete(sequence);
                    
                    const subscribers = [...(context.keymap[identifier].subscribers ?? []), ...context.subscribers[identifier]];

                    for(const [name, subscriber] of subscribers) {
                        if(subscriber({
                            name,
                            keybinding: {
                                identifier: identifier,
                                name: context.keymap[identifier].name,
                                keybindings: context.keymap[identifier].keybindings
                            },
                            trigger: sequence,
                            event: event
                        }) === false) {
                            break;
                        }
                    }
                }
            });
    
            if (timer) {
                clearTimeout(timer);
            }
    
            timer = setTimeout(possibleMatches.clear.bind(possibleMatches), timeout);
        }
    }

    let unsubscribe: Unsubscriber = () => undefined;

    function subscribe (context: InternalContext) {
        unsubscribe();

        const eventListener = createEventListener(context);
        target().addEventListener("keydown", eventListener)

        return function off() {
            target().removeEventListener("keydown", eventListener)
        }
    }

    context.subscribe(context => {
        unsubscribe = subscribe(context);
    })

    return {
        on
    }
}

export const keymap = createKeyMap(() => window, defaultKeyMap)