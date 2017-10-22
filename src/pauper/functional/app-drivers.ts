import { Mouse } from "../core/input/Mouse";
import { FrameCollection } from "./render-frame.model";
import { Keyboard } from "../core/input/Keyboard";
import { Observable } from "rxjs/Observable";

export type AppDrivers = {
	readonly keyboard?: Keyboard;
	readonly mouse?: Mouse;
	readonly renderer: (frame: Observable<FrameCollection>) => Observable<{}>;
};
