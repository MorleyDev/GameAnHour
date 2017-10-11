import { Key } from "../core/models/keys.model";
import { GenericAction } from "./generic.action";

export type KeyUpAction = { type: "SYS_KeyUpAction", key: Key };
export const KeyUpAction = Object.assign(
	(key: Key): KeyUpAction => ({ type: "SYS_KeyUpAction", key }),
	{
		is: (action: GenericAction): action is KeyUpAction => action.type === "SYS_KeyUpAction"
	}
);
