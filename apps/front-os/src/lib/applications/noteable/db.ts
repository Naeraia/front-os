import Dexie, { type Table } from 'dexie';
import { writable } from 'svelte/store';

export interface NoteableNote {
    id?: number
    title: string
    content: string
    created: Date
    updated: Date
}

export class NoteableDb extends Dexie {
    notes!: Table<NoteableNote>

    constructor() {
        super("system:noteable:db")

        this.version(1).stores({
            notes: '++id,title,content,created,updated'
        })
    }
}

export const noteableDb = new NoteableDb();

export const deletedNote = writable<NoteableNote|undefined>()