import { AdvancePhysicsAction } from "./physics.actions";
import { GameTick } from "../game/game-tick.type";

export const physicsTick: GameTick = tick$ => tick$.map(({ state, deltaTime }) => AdvancePhysicsAction(deltaTime));
