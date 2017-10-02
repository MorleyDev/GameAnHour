import { SystemAction } from "../../functional/system.action";

export type GameAction = SystemAction | { type: "NOOP" };
