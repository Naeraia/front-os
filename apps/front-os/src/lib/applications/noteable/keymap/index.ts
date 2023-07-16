import { createKeyMap } from "@front-os/core/dist"

export enum NoteableCommands {
    KeyMap = 'notable.keymap',
    NewNote = 'notable.notes.new',
    SaveNote = 'notable.notes.save'
}

const keymap = createKeyMap(() => window, {
    [NoteableCommands.NewNote]: {
        name: "New Note",
        keybindings: ["N"]
    },
    [NoteableCommands.SaveNote]: {
        name: "Save Note",
        keybindings: ["$mod+S"]
    },
    [NoteableCommands.KeyMap]: {
        name: "Keymap",
        keybindings: ["$mod+/"]
    }
})

export default keymap