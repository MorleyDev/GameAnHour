import { Key } from "../core/models/keys.model";
import { GenericAction } from "./generic.action";

export type KeyDownAction = { type: "SYS_KeyDownAction", key: Key };
export const KeyDownAction = Object.assign(
	(key: Key) => ({ type: "SYS_KeyDownAction", key }),
	{
		is: (action: GenericAction): action is KeyDownAction => action.type === "SYS_KeyDownAction"
	}
);
