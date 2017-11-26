import "@babel/polyfill";

import { isBrowser } from "@morleydev/pauper/utility/is-browser";
import { isProduction } from "@morleydev/pauper/utility/is-production";

if (isBrowser) {
	if (!isProduction && (module as any).hot) {
		require("./engine/browser/hot-reload");
	} else {
		require("./engine/browser/production");
	}
} else {
}
