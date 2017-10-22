import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

import { GenericAction } from "../pauper/functional/generic.action";

export const bootstrap: Observable<GenericAction> = from([
	{ type: "@@INIT" }
]);
