import { derived, get, writable, type Readable, type Writable } from "svelte/store";
import type { SvelteComponent } from "svelte"

export enum ApplicationType {
    APPLICATION = 'application'
}
export type ProcessId = `${string}-${string}-${string}-${string}-${string}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationComponent = new (...args: any) => SvelteComponent<any>

export interface ApplicationBase {
    key: string
    name: string
    description: string
    author?: string
    icon?: string
    type: ApplicationType
    location: string | 'system',
    components: {
        window?: ApplicationComponent
        background?: ApplicationComponent
    },
    events?: {
        preflight?: (process: Writable<Process>) => undefined | false
        launched?: (process: Writable<Process>) => void
        exit?: (exit: () => void) => void
    },
    flags?: {
        multiple: boolean
        spawnsChildren?: boolean
    },
    details?: Record<string, unknown>
}

export interface Application extends ApplicationBase {
    arguments: string[]
}

export interface ProcessManager {
    list: Writable<Writable<Process>[]>;
    open: (app: ApplicationBase, args?: string[], callback?: (process: Writable<Process>) => void) => ProcessStart;
    close: (pid: ProcessId, force?: boolean) => ProcessExit;
    closeAll: (force?: boolean) => ProcessExit[];
    find: (pid: ProcessId | ((process: Process) => boolean)) => Writable<Process> | undefined;
    findMany: (pids: ProcessId[]) => Writable<Process>[] | undefined;
    windows(): Readable<Process[]>
}

export interface Process {
    pid: ProcessId
    time: {
        created: Date
    },
    app: Application
    children?: ProcessManager
    exit: (force?: boolean) => ProcessExit,
}

export enum ProcessStart {
    SUCCESS,
    DUPLICATE,
    FAILED
}

export enum ProcessExit {
    SUCCESS,
    DEFERRED,
    FAILED
}

export function createProcessManager(): ProcessManager {
    const processes = writable<Writable<Process>[]>([])

    function close(pid: ProcessId, force = false): ProcessExit {
        let processExit = ProcessExit.FAILED;

        processes.update(list => {
            const index = list.findIndex((process) => get(process).pid === pid);

            if(list[index]) {
                const exit = get(list[index]).app?.events?.exit;

                if(exit && !force) {
                    exit(() => close(pid, true))
                    processExit = ProcessExit.DEFERRED
                } else {
                    list.splice(index, 1);
                    ProcessExit.SUCCESS
                }
            }

            return list;
        })

        return processExit;
    }

    function open(app: ApplicationBase, args: string[] = [], callback?: (process: Writable<Process>) => void) {
        if(!app.flags?.multiple && find(proc => proc.app.key === app.key)) {
            return ProcessStart.DUPLICATE;
        }

        const pid = crypto.randomUUID()

        const process = writable<Process>({
            pid,
            time: {
                created: new Date
            },
            app: {
                ...app,
                arguments: args
            },
            children: app.flags?.spawnsChildren ? createProcessManager() : undefined,
            exit: (force = false) => close(pid, force)
        })

        if(app.events?.preflight && app.events?.preflight(process) === false)
            return ProcessStart.FAILED

        processes.update(list => {
            list.push(process)
            return list
        })

        if(app.events?.launched)
            app.events?.launched(process);

        if(callback) {
            callback(process);
        }

        return ProcessStart.SUCCESS;
    }

    function find(pid: ProcessId | ((process: Process) => boolean)) {
        return get(processes).find(process => {
            const proc = get(process);
            return typeof pid === "string" ? proc.pid === pid : pid(proc)
        })
    }

    function findMany(pids: ProcessId[]) {
        return get(processes).filter(process => pids.includes(get(process).pid))
    }

    function closeAll(force = false) {
        return get(processes).map(item => get(item).exit(force))
    }

    return {
        list: processes,
        open,
        close,
        closeAll,
        find,
        findMany,
        windows() {
            return derived(processes, processes => {
                const windows: Process[] = []

                processes.forEach(process => {
                    const proc = get(process)

                    if(proc.app.components.window) {
                        windows.push(proc)
                    }

                    if(proc.children) {
                        windows.push(...get(proc.children.windows()))
                    }
                })

                return windows;
            })
        }
    }
}