import { SystemAction } from "../pauper/functional/system.action";
import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";

export enum GameStateFlag {
	Initialising,
	Ready,
	Playing,
	GameOver
};

export type GameState
	= EntitiesState
	& SystemState
	& {
		currentState: GameStateFlag
	};

export type GameAction
	= SystemAction
	| { type: "GameReady" }
	| { type: "RequestStartGame" };
