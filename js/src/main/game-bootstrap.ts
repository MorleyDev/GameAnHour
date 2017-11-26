import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";
import { fromPromise } from "rxjs/observable/fromPromise";
import { merge } from "rxjs/observable/merge";
import { ignoreElements } from "rxjs/operators";

import { AssetDrivers } from "@morleydev/pauper/app-drivers";
import { CreateBackWall, CreateBottomWall, CreateFrontWall, CreatePlayer, CreateTopWall } from "./component/types";
import { GameAction } from "./game.model";

export const bootstrap = (drivers: AssetDrivers): Observable<GameAction> => {
	return merge(
		from(CreatePlayer()),
		from(CreateBottomWall()),
		from(CreateTopWall()),
		from(CreateBackWall()),
		from(CreateFrontWall()),
		fromPromise(drivers.loader.loadFont("sans-serif", "./assets/fonts/sans-serif.ttf")).pipe(ignoreElements()) as Observable<GameAction>
	);
};
