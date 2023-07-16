import { writable, type Unsubscriber } from "svelte/store";

export type KeyBindingIdentifier = string
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

export interface KeyBindingMap {
	[keybinding: string]: (event: KeyboardEvent) => void;
}

export interface KeyBindingHandlerOptions {
	timeout?: number;
}

interface InternalContext {
    timeout: number,
    keymap: KeyMap,
    subscribers: KeyBindingListeners
}

type KeyBindingPress = [string[], string];

/**
 * Options to configure the behavior of keybindings.
 */
export interface KeyBindingOptions extends KeyBindingHandlerOptions {
	/**
	 * Key presses will listen to this event (default: "keydown").
	 */
	event?: 'keydown' | 'keyup';
}

/**
 * These are the modifier keys that change the meaning of keybindings.
 *
 * Note: Ignoring "AltGraph" because it is covered by the others.
 */
const KEYBINDING_MODIFIER_KEYS = ['Shift', 'Meta', 'Alt', 'Control'];

/**
 * Keybinding sequences should timeout if individual key presses are more than
 * 1s apart by default.
 */
const DEFAULT_TIMEOUT = 1000;

/**
 * Keybinding sequences should bind to this event by default.
 */
const DEFAULT_EVENT = 'keydown';

/**
 * Platform detection code.
 * @see https://github.com/jamiebuilds/tinykeys/issues/184
 */
const PLATFORM = typeof navigator === 'object' ? navigator.platform : '';
const APPLE_DEVICE = /Mac|iPod|iPhone|iPad/.test(PLATFORM);

/**
 * An alias for creating platform-specific keybinding aliases.
 */
const MOD = APPLE_DEVICE ? 'Meta' : 'Control';

/**
 * Meaning of `AltGraph`, from MDN:
 * - Windows: Both Alt and Ctrl keys are pressed, or AltGr key is pressed
 * - Mac: ⌥ Option key pressed
 * - Linux: Level 3 Shift key (or Level 5 Shift key) pressed
 * - Android: Not supported
 * @see https://github.com/jamiebuilds/tinykeys/issues/185
 */
const ALT_GRAPH_ALIASES = PLATFORM === 'Win32' ? ['Control', 'Alt'] : APPLE_DEVICE ? ['Alt'] : [];

/**
 * There's a bug in Chrome that causes event.getModifierState not to exist on
 * KeyboardEvent's for F1/F2/etc keys.
 */
export function getModifierState(event: KeyboardEvent, mod: string) {
	return typeof event.getModifierState === 'function'
		? event.getModifierState(mod) ||
				(ALT_GRAPH_ALIASES.includes(mod) && event.getModifierState('AltGraph'))
		: false;
}

/**
 * Parses a "Key Binding String" into its parts
 *
 * grammar    = `<sequence>`
 * <sequence> = `<press> <press> <press> ...`
 * <press>    = `<key>` or `<mods>+<key>`
 * <mods>     = `<mod>+<mod>+...`
 */
export function parseKeybinding(str: string): KeyBindingPress[] {
	return str
		.trim()
		.split(' ')
		.map((press) => {
			let mods = press.split(/\b\+/);
			const key = mods.pop() as string;
			mods = mods.map((mod) => (mod === '$mod' ? MOD : mod));
			return [mods, key];
		});
}

/**
 * This tells us if a series of events matches a key binding sequence either
 * partially or exactly.
 */
export function match(event: KeyboardEvent, press: KeyBindingPress): boolean {
	// prettier-ignore
	return !(
        // Allow either the `event.key` or the `event.code`
        // MDN event.key: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        // MDN event.code: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
        (
            press[1].toUpperCase() !== event.key.toUpperCase() &&
            press[1] !== event.code
        ) ||

        // Ensure all the modifiers in the keybinding are pressed.
        press[0].find(mod => {
            return !getModifierState(event, mod)
        }) ||

        // KEYBINDING_MODIFIER_KEYS (Shift/Control/etc) change the meaning of a
        // keybinding. So if they are pressed but aren't part of the current
        // keybinding press, then we don't have a match.
        KEYBINDING_MODIFIER_KEYS.find(mod => {
            return !press[0].includes(mod) && press[1] !== mod && getModifierState(event, mod)
        })
    )
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