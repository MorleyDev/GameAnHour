import { Key } from "../core/models/keys.model";

export type KeyUp = { type: "EVENTS_KEY_UP", key: Key };
export const KeyUp = (key: Key) => ({ type: "EVENTS_KEY_UP", key });
