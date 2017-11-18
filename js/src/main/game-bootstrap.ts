import { Observable } from "rxjs/Observable";
import { fromPromise } from "rxjs/observable/fromPromise";
import { merge } from "rxjs/observable/merge";
import { ignoreElements } from "rxjs/operators";

import { AssetDrivers } from "../pauper/app-drivers";
import { GameAction } from "./game.model";

export const bootstrap = (drivers: AssetDrivers): Observable<GameAction> => {
	return merge(
		fromPromise(drivers.loader.loadFont("sans-serif", "./assets/fonts/sans-serif.ttf")).pipe(ignoreElements()) as Observable<GameAction>
	);
};
