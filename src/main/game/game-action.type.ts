import { EntityComponentAction } from "../ec/entity-component.actions";
import { SystemAction } from "../../functional/system.action";

export type GameAction = SystemAction | EntityComponentAction;
