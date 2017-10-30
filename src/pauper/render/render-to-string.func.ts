import { FrameCollection, Frame } from "./render-frame.model";

export function renderToString(frame: FrameCollection): string {
	return JSON.stringify(frame, undefined, "\t");
}
