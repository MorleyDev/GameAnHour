import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

import { AppDrivers } from "../pauper/functional/app-drivers";
import { GenericAction } from "../pauper/functional/generic.action";

export const bootstrap: (drivers: AppDrivers) => Observable<GenericAction> = drivers => from([
	{ type: "@@INIT" }
]);
