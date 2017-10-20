import { Seconds } from "../pauper/core/models/time.model";
import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";

export enum GameStateFlag {
	Initialising,
	Ready,
	Playing,
	GameOver
}

export type GameState
	= EntitiesState
	& SystemState
	& { readonly currentState: GameStateFlag }
	& { readonly effects: ReadonlyArray<GameAction>; };

export type GameAction
	= { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "RequestGameRestart" }
	| { readonly type: "GameReady" }
	| { readonly type: "RequestStartGame" }
	| { readonly type: "Player_StartMovingLeft" }
	| { readonly type: "Player_StopMovingLeft" }
	| { readonly type: "Player_StartMovingRight" }
	| { readonly type: "Player_StopMovingRight" }
	| { readonly type: "PlaySoundEffect"; readonly soundId: string; };
