import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

import { GenericAction } from "../pauper/functional/generic.action";
import { CreateBallEntityActions } from "./entities/BallEntity";
import { CreateBlockEntityActions } from "./entities/BlockEntity";
import { CreatePaddleEntityActions } from "./entities/PaddleEntity";

const blockGrid = Array(5).fill(0).mergeMap((_, j) => Array(12).fill(0).map((_, i) => [i, j]));

export const bootstrap: Observable<GenericAction> =
	from([
		...CreateBallEntityActions(),
		...CreatePaddleEntityActions(),
		...blockGrid.mergeMap(([x, y]) => CreateBlockEntityActions(x, y)),
		{ type: "GameReady" }
	]);
