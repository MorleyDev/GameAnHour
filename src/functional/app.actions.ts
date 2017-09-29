import { Key } from "../core/models/keys.model";

export type SystemAction = KeyDown | KeyUp;

export type KeyDown = { type: "EVENTS_KEY_DOWN", key: Key };
export const KeyDown = (key: Key) => ({ type: "EVENTS_KEY_DOWN", key });

export type KeyUp = { type: "EVENTS_KEY_UP", key: Key };
export const KeyUp = (key: Key) => ({ type: "EVENTS_KEY_UP", key });
