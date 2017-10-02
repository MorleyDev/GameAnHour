import { EntitiesState } from "../ec/entities.state";
import { SystemState } from "../../functional/system.state";

export type GameState = EntitiesState & SystemState;
