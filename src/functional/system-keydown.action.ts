import { Key } from "../core/models/keys.model";

export type KeyDownAction = { type: "SYS_KeyDownAction", key: Key };
export const KeyDownAction = (key: Key) => ({ type: "SYS_KeyDownAction", key });
