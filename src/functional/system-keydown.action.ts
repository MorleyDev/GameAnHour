import { Key } from "../core/models/keys.model";

export type KeyDown = { type: "EVENTS_KEY_DOWN", key: Key };
export const KeyDown = (key: Key) => ({ type: "EVENTS_KEY_DOWN", key });
