import { MouseButton } from "../pauper/core/models/mouseButton";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { fromEvent } from "rxjs/observable/fromEvent";
import { Text2 } from "../pauper/core/models/text/text.model";
import { patternMatch } from "../pauper/functional/utility-pattern-match.function";
import { Circle, Point2, Rectangle } from "../pauper/core/models/shapes.model";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { ignoreElements, map, tap } from "rxjs/operators";

import { WebAssetLoader } from "../pauper/core/assets/web-asset-loader.service";
import { WebAudioService } from "../pauper/core/audio/web-audio.service";
import { Clear, Stroke, Origin, Fill } from "../pauper/functional/render-frame.model";
import { Cell, CellGrid, GameAction, GameState } from "./game.model";

const audioPlayer = new WebAudioService();
const assetLoader = new WebAssetLoader();

const getCell = (grid: CellGrid, x: number, y: number) => grid.cells[x + y * grid.width];
const updateCell = (grid: CellGrid, x: number, y: number, map: (cell: Cell) => Cell) => ({
	...grid,
	cells: updateAt(grid.cells, x + y * grid.width, map)
})
const mapCells = <T>(grid: CellGrid, mapper: (cell: Cell, position: Point2) => T) => grid.cells.map((cell, index) => mapper(cell, Point2(index % grid.width, (index / grid.height | 0))))

const Range = (start: number, count: number) => Array(count).fill(start).map((_, i) => i + start);

const revealBoard = (board: CellGrid) => Range(0, board.width)
	.mergeMap(x => Range(0, board.height).map(y => ({ x, y })))
	.reduce((board, { x, y }) => updateCell(board, x, y, cell => ({
		...cell,
		state: "revealed"
	})), board);

const updateAt = <T>(array: ReadonlyArray<T>, index: number, updator: (value: T) => T): ReadonlyArray<T> =>
	array.map((item, i) => i === index ? updator(item) : item);

const getNeighbouringCells = (board: CellGrid, currentX: number, currentY: number): ReadonlyArray<Point2> => {
	return Range(currentY - 1, 3).mergeMap(y => Range(currentX - 1, 3).map(x => ({ x, y })))
		.filter(({ x, y }) => x !== currentY || y !== currentY)
		.filter(({ x, y }) => x >= 0 && x < board.width && y >= 0 && y < board.height);
}

const floodFillCells = (board: CellGrid, x: number, y: number): CellGrid => {
	const currentCell = getCell(board, x, y);
	if (currentCell.state === "revealed") {
		return board;
	}

	const revealCurrent = updateCell(board, x, y, c => ({
		...c,
		state: "revealed"
	}));
	if (currentCell.neighbouringMines > 0) {
		return revealCurrent;
	}

	return getNeighbouringCells(board, x, y)
		.reduce((board, neighbour) => floodFillCells(board, neighbour.x, neighbour.y), revealCurrent);
}

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "PLANT_FLAG":
			return {
				...state,
				mineboard: updateCell(state.mineboard, action.x, action.y, cell => cell.state === "unrevealed" ? ({
					...cell,
					state: "flagged"
				}) : cell)
			}
		case "REVEAL_CELL":
			const chosenCell = getCell(state.mineboard, action.x, action.y);
			if (chosenCell.contents === "mine") {
				return {
					...state,
					mineboard: revealBoard(state.mineboard)
				};
			}
			return {
				...state,
				mineboard: floodFillCells(state.mineboard, action.x, action.y)
			};
		default:
			return state;
	}
}

export const render = (state: GameState) => [
	Clear("white"),
	mapCells(state.mineboard, (cell, position) => ({ ...position, ...cell }))
		.map(renderCell)
];

const renderCell = (cell: Cell & { readonly x: number; readonly y: number }) => {
	const inner = patternMatch(cell.state,
		["unrevealed", () => []],
		["flagged", () => [
			Origin(Point2(cell.x * 32 + 16, cell.y * 32 + 16), [
				Stroke(Circle(0, 0, 10), "green")
			])
		]],
		["revealed", () => [
			Origin(Point2(cell.x * 32 + 16, cell.y * 32 + 16), [
				cell.contents === "empty"
					? Fill(Text2(`${cell.neighbouringMines}`, -8, 5, undefined, "24px", "sans-serif"), "green")
					: Fill(Circle(0, 0, 10), "black")
			])
		]]
	);
	return [
		Stroke(Rectangle(cell.x * 32, cell.y * 32, 32, 32), "black"),
		...inner
	];
}

const canvasDom = document.getElementById("render-target")!;

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge(
	drivers.mouse!.mouseUp(MouseButton.Left).pipe(
		map(position => Point2((position.x / 32) | 0, (position.y / 32) | 0)),
		map(grid => ({ type: "REVEAL_CELL", ...grid }))
	),
	drivers.mouse!.mouseUp(MouseButton.Right).pipe(
		map(position => Point2((position.x / 32) | 0, (position.y / 32) | 0)),
		map(grid => ({ type: "PLANT_FLAG", ...grid }))
	)
);

export const postprocess = (state: GameState): { readonly state: GameState; readonly actions: ReadonlyArray<GameAction> } => ({
	state: {
		...state,
		effects: []
	},
	actions: state.effects
});
