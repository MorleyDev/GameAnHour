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
	& {
		currentState: GameStateFlag
	};

export type GameAction
	= { type: "@@TICK", deltaTime: Seconds }
	| { type: "RequestGameRestart" }
	| { type: "GameReady" }
	| { type: "RequestStartGame" }
	| { type: "Player_StartMovingLeft" }
	| { type: "Player_StopMovingLeft" }
	| { type: "Player_StartMovingRight" }
	| { type: "Player_StopMovingRight" };
