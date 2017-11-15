
declare function ENGINE_Stash(str: string): void;

declare let ENGINE_Reloading: () => void;
declare let ENGINE_Reloaded: (state: string) => void;

declare function WORKER_Emit(msg: string): void;
declare let WORKER_Receive: (msg: string) => void;
declare let WORKER_Join: (name: string) => void;

declare function SECONDARY_Emit(msg: string): void;
declare let SECONDARY_Receive: (msg: string) => void;
declare let SECONDARY_Join: (name: string) => void;
