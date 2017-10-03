import { EntitiesState } from "../../entity-component/entities.state";
import { SystemState } from "../../functional/system.state";

export type GameState = EntitiesState & SystemState;
