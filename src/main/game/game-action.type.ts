import { SystemAction } from "../../functional/system.action";
import { EntityComponentAction } from "../../entity-component/entity-component.actions";
import { PhysicsAction } from "../physics/physics.actions";

export type GameAction = SystemAction | EntityComponentAction | PhysicsAction;
