import { Key } from "../core/models/keys.model";

export type KeyUpAction = { type: "SYS_KeyUpAction", key: Key };
export const KeyUpAction = (key: Key): KeyUpAction => ({ type: "SYS_KeyUpAction", key });
