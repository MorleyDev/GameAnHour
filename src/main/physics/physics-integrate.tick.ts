import { GameTick } from "../game/game-tick.type";
import { AdvancePhysicsAction } from "./physics.actions";

export const physicsIntegrationTick: GameTick = tick$ => tick$.map(({ state, deltaTime }) => AdvancePhysicsAction(deltaTime));
