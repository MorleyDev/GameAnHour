import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

import { AppDrivers } from "../pauper/functional/app-drivers";
import { GenericAction } from "../pauper/functional/generic.action";
import { GameAction } from "./game.model";

export const bootstrap: (drivers: AppDrivers) => Observable<GameAction> = drivers => from<GameAction>([
	{ type: "@@INIT" }
]);
