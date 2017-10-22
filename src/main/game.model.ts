import { Seconds } from "../pauper/core/models/time.model";
import { SystemState } from "../pauper/functional";

export type Cell = {
	readonly state: "unrevealed" | "flagged" | "revealed";
	readonly contents: "empty" | "mine";
	readonly neighbouringMines: number;
};

export type CellGrid = {
	readonly cells: ReadonlyArray<Cell>;
	readonly width: number;
	readonly height: number;
}

export type GameState
	= SystemState
	& { readonly effects: ReadonlyArray<GameAction>; }
	& { readonly mineboard: CellGrid; };

export type GameAction
	= { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "PLANT_FLAG"; readonly x: number; readonly y: number }
	| { readonly type: "REVEAL_CELL"; readonly x: number; readonly y: number };
	