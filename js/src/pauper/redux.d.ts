declare function REDUX_SetState(json: string): void;
declare function REDUX_SendAction(json: string): void;

declare function REDUX_GetState(): string;
declare function REDUX_ReceiveAction(): string | undefined;
