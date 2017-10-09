import { applyPhysicsForceReducer } from "./physics/physics-apply-force.reducer";
import { createReducer } from "../functional/create-reducer.func";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { Key } from "../core/models/keys.model";
import { Point2, Shape2 } from "../core/models/shapes.model";
import { Seconds } from "../core/models/time.model";
import { createEntitiesStateMap } from "../entity-component/create-entities-state-map.func";
import { createEntityReducer } from "../entity-component/create-entity-reducer.func";
import { EntityId } from "../entity-component/entity-base.type";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { Clear, Fill, FrameCollection, Origin } from "../functional/render-frame.model";
import { SystemAction } from "../functional/system.action";
import { initialState } from "./game-initial-state";
import { GameAction, GameState } from "./game-models";
import { applyPhysicsAdvanceIntegration } from "./physics/physics-advance-integration.update";
import { PhysicsApplyForceAction } from "./physics/physics-apply-force.action";
import { PhysicsChangeActiveCollisionsAction } from "./physics/physics-change-active-collisions.action";
import { PhysicsCollidableComponent } from "./physics/physics-collidable.component";
import { applyPhysicsCollisionDetection } from "./physics/physics-collision-detection.update";
import { physicsIntegratorReducer } from "./physics/physics-integrator.reducer";
import { PhysicsPhysicalComponent } from "./physics/physics-physical.component";
import { List } from "immutable";

const renderCollisionMaps = createEntitiesStateMap<GameState, FrameCollection>(
	["PHYS_PhysicsPhysicalComponent", "PHYS_PhysicsCollidableComponent", "RENDER_Colour"],
	(_, physical: PhysicsPhysicalComponent, collidable: PhysicsCollidableComponent, renderColour: ({ name: "RENDER_Colour", colour: string })) => [
		Fill(Shape2.add(collidable.properties.collision, physical.properties.position), renderColour.colour)
	]
);

const reducer = (state: GameState, action: GameAction): GameState => {
	function boundAtWalls(physical: PhysicsPhysicalComponent): PhysicsPhysicalComponent {
		const constrainedX = Math.max(-320, Math.min(320, physical.properties.position.x));
		const constrainedY = Math.max(-240, Math.min(240, physical.properties.position.y));
		let velocityX = physical.properties.velocity.x;
		let velocityY = physical.properties.velocity.y;
		if (constrainedX === 320) {
			velocityX = -Math.abs(velocityX * 0.5);
		} else if (constrainedX === -320) {
			velocityX = Math.abs(velocityX * 0.5);
		}

		if (constrainedY === 240) {
			velocityY = -Math.abs(velocityY * 0.5);
		} else if (constrainedY === -240) {
			velocityY = Math.abs(velocityY * 0.5);
		}
		return {
			...physical,
			properties: {
				...physical.properties,
				position: {
					x: constrainedX,
					y: constrainedY
				},
				velocity: {
					x: velocityX,
					y: velocityY
				}
			}
		};
	}

	const constrainedPhysics = createReducer<GameState>(
		["PHYS_PhysicsAdvanceIntegrationAction", createEntityReducer(
			["PHYS_PhysicsPhysicalComponent"],
			(action, physical: PhysicsPhysicalComponent) => [boundAtWalls(physical)]
		)],
		["GAME_StartCollision", (state, action) => onCollision(state, action)],
		["GAME_CreateExplosion", (state, action) => {
			const actions = List(applyExplosionForce(action.position, action.magnitude)(state));
			
			return actions.reduce((state, actions) => actions.reduce((state, action) => applyPhysicsForceReducer(state, action), state), state);
		}]
	);

	return entityComponentReducer(constrainedPhysics(physicsIntegratorReducer(state, action), action), action);
};

const update = (tick$: Observable<{ state: GameState, deltaTime: Seconds }>): Observable<GameAction> => {
	return merge(
		applyPhysicsCollisionDetection(tick$),
		applyPhysicsAdvanceIntegration(tick$)
	);
}

const render = (state: GameState): FrameCollection => {
	return [
		Clear,
		Origin({ x: 320, y: 240 }, [
			Array.from(renderCollisionMaps(state))
		])
	];
}

const onCollision = (state: GameState, action: any): GameState => {
	const { lhs, rhs } = action as { lhs: EntityId; rhs: EntityId; };
	const lhsEntity = state.entities.at(lhs)!;
	const rhsEntity = state.entities.at(rhs)!;
	const lhsPhysical = lhsEntity.components.at("PHYS_PhysicsPhysicalComponent")! as PhysicsPhysicalComponent;
	const rhsPhysical = rhsEntity.components.at("PHYS_PhysicsPhysicalComponent")! as PhysicsPhysicalComponent;
	const force = Vector2.magnitude(Vector2.add(lhsPhysical.properties.velocity, rhsPhysical.properties.velocity));
	const angleBetween = Vector2.subtract(rhsPhysical.properties.velocity, lhsPhysical.properties.velocity)
	const newForceRight = Vector2.multiply(Vector2.normalise(angleBetween), force);
	const newForceLeft = Vector2.invert(newForceRight);
	return [
		PhysicsApplyForceAction(rhs, newForceLeft),
		PhysicsApplyForceAction(lhs, newForceRight)
	].reduce((state, action) => applyPhysicsForceReducer(state, action), state);
};

const epic = (action$: Observable<GameAction>): Observable<GameAction> => {
	return merge(
		action$
			.filter(action => action.type === "PHYS_PhysicsChangeActiveCollisionsAction")
			.mergeMap((action: PhysicsChangeActiveCollisionsAction) => action.active)
			.map(([lhs, rhs]: [EntityId, EntityId]) => ({ type: "GAME_StartCollision", lhs, rhs })),
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.Space)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(0, 290), magnitude: 4800 }) as GameAction)
	);
}

function applyExplosionForce(position: Point2, magnitude: number) {
	return createEntitiesStateMap(["PHYS_PhysicsPhysicalComponent"], (entityId: EntityId, physical: PhysicsPhysicalComponent) => {
		const distance = Vector2.subtract(physical.properties.position, position);
		if (Vector2.magnitudeSquared(distance) > magnitude * magnitude) {
			return [];
		}
		return [
			PhysicsApplyForceAction(entityId, Vector2.multiply(Vector2.normalise(distance), magnitude - Vector2.magnitude(distance)))
		];
	})
}

export const app = () => ({
	epic,
	initialState,
	reducer,
	render,
	update
});
