import { KeyDownAction } from "./system-keydown.action";
import { KeyUpAction } from "./system-keyup.action";
import { TickAction } from "./system-tick.action";

export type SystemAction = KeyDownAction | KeyUpAction | TickAction;
