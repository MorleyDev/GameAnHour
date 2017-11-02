import "core-js";

import { isBrowser } from "./pauper/utility/is-browser";
import { isProduction } from "./pauper/utility/is-production";

if (isBrowser) {
	if (!isProduction && (module as any).hot) {
		require("./engine/browser/hot-reload");
	} else {
		require("./engine/browser/production");
	}
} else {
}
