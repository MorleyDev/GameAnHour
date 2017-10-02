import { SystemAction } from "../../functional/app.actions";

export type GameAction = SystemAction | { type: "NOOP" };
