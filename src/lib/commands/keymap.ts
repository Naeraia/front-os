import type { KeyMap } from ".";

export enum Commands {
	CANCEL = 'commands.cancel'
}

export const keymap: KeyMap = {
	[Commands.CANCEL]: {
		name: 'Cancel',
		keybindings: ['Escape']
	},
};