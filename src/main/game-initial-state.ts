import { Cell, CellGrid, GameState } from "./game.model";
import { SystemState } from "../pauper/functional";

const Range = (start: number, count: number) => Array(count).fill(start).map((_, i) => i + start);

const MakeGrid = (width: number, height: number, cells: ReadonlyArray<Cell>): CellGrid => ({
	cells,
	height,
	width
});

const GenerateEmptyBoard = (width: number, height: number): CellGrid => Range(0, height)
	.mergeMap(row => Range(0, width).map(column => ({ y: row, x: column })))
	.map((point, index) => ({
		index,
		contents: "empty",
		state: "unrevealed",
		neighbouringMines: 0
	} as Cell))
	.fpipe((cells) => MakeGrid(width, height, cells));

const updateAt = <T>(array: ReadonlyArray<T>, index: number, updator: (value: T) => T): ReadonlyArray<T> =>
	array.map((item, i) => i === index ? updator(item) : item);

const AddMineToBoard = (board: CellGrid): CellGrid => {
	while (true) {
		const index = (Math.random() * board.cells.length) | 0;
		if (board.cells[index].contents === "mine") {
			continue;
		}
		return {
			...board,
			cells: updateAt(board.cells, index, v => ({ ...v, contents: "mine" } as Cell))
		};
	}
}

const AddMinesToBoard = (board: CellGrid, mines: number): CellGrid => {
	if (mines === 0) {
		return board;
	}
	return AddMinesToBoard(AddMineToBoard(board), mines - 1);
};

const CountNeighboursForCell = (board: ReadonlyArray<Cell>, boardWidth: number, boardHeight: number, index: number) => {
	const currentPosition = {
		x: index % boardWidth,
		y: (index / boardWidth) | 0
	};
	return Range(currentPosition.y - 1, 3).mergeMap(y => Range(currentPosition.x - 1, 3).map(x => ({ x, y })))
		.filter(({ x, y }) => x !== currentPosition.x || y !== currentPosition.y)
		.filter(({ x, y }) => x >= 0 && x < boardWidth && y >= 0 && y < boardHeight)
		.map(({ x, y }) => board[x + y * boardWidth])
		.reduce((count, cell) => cell.contents === "mine" ? count + 1 : count, 0);
};

const PopulateNeighbourCounts = (board: CellGrid) =>
	({
		...board,
		cells: board.cells.map((cell, index) => ({
			...cell,
			neighbouringMines: CountNeighboursForCell(board.cells, board.width, board.height, index)
		}))
	});

export const initialState: GameState = SystemState({
	effects: [],
	mineboard: GenerateEmptyBoard(16, 16)
		.fpipe(AddMinesToBoard, 30)
		.fpipe(PopulateNeighbourCounts)
});
