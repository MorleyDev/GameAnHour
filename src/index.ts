import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/bufferCount";

import "./core/extensions";
import "./main/game";

if ((module as any).hot) {
	(module as any).hot.accept();
}
