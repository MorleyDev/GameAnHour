import { applyPhysicsForceReducer } from "./physics-apply-force.reducer";
import { createReducer } from "../../functional/create-reducer.func";
import { GenericAction } from "../../functional/generic.action";
import { GameState } from "../game-models";
import { applyPhysicsGravity, applyPhysicsIntegrator } from "./physics-integrators.func";

export const physicsIntegratorReducer = createReducer<GameState, GenericAction>(
	["@@TICK", applyPhysicsIntegrator],
	["@@TICK", applyPhysicsGravity],
	["PHYS_PhysicsApplyForceAction", applyPhysicsForceReducer]
);
