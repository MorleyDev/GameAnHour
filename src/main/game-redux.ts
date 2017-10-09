import { Seq } from "immutable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { Key } from "../core/models/keys.model";
import { Point2, Shape2 } from "../core/models/shapes.model";
import { createEntitiesStateMap } from "../entity-component/create-entities-state-map.func";
import { createEntityReducer } from "../entity-component/create-entity-reducer.func";
import { EntityId } from "../entity-component/entity-base.type";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { createReducer } from "../functional/create-reducer.func";
import { Clear, Fill, FrameCollection, Origin } from "../functional/render-frame.model";
import { TickAction } from "../functional/system-tick.action";
import { SystemAction } from "../functional/system.action";
import { initialState } from "./game-initial-state";
import { GameAction, GameState } from "./game-models";
import { PhysicsApplyForceAction } from "./physics/physics-apply-force.action";
import { applyPhysicsForceReducer } from "./physics/physics-apply-force.reducer";
import { PhysicsCollidableComponent } from "./physics/physics-collidable.component";
import { applyCollisionDetectionDelta, findPhysicsCollisionDetectionDelta } from "./physics/physics-collision-detection.func";
import { physicsIntegratorReducer } from "./physics/physics-integrator.reducer";
import { PhysicsPhysicalComponent } from "./physics/physics-physical.component";

const renderCollisionMaps = createEntitiesStateMap<GameState, FrameCollection>(
	["PHYS_PhysicsPhysicalComponent", "PHYS_PhysicsCollidableComponent", "RENDER_Colour"],
	(_: EntityId, physical: PhysicsPhysicalComponent, collidable: PhysicsCollidableComponent, renderColour: ({ name: "RENDER_Colour", colour: string })) => [
		Fill(Shape2.add(collidable.properties.collision, physical.properties.position), renderColour.colour)
	]
);

function boundAtWalls(physical: PhysicsPhysicalComponent): PhysicsPhysicalComponent {
	const constrainedX = Math.max(-320, Math.min(320, physical.properties.position.x));
	const constrainedY = Math.max(-240, Math.min(240, physical.properties.position.y));
	let velocityX = physical.properties.velocity.x;
	let velocityY = physical.properties.velocity.y;
	if (constrainedX === 320) {
		velocityX = -Math.abs(velocityX * 0.75);
	} else if (constrainedX === -320) {
		velocityX = Math.abs(velocityX * 0.75);
	}

	if (constrainedY === 240) {
		velocityY = -Math.abs(velocityY * 0.75);
	} else if (constrainedY === -240) {
		velocityY = Math.abs(velocityY * 0.75);
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
	["@@TICK", createEntityReducer(["PHYS_PhysicsPhysicalComponent"], (action, physical: PhysicsPhysicalComponent) => [boundAtWalls(physical)])],
	["@@TICK", (state: GameState, action: TickAction) => {
		const delta = findPhysicsCollisionDetectionDelta(state);
		return delta.active
			.reduce((state, active) => onCollision(state, active[0], active[1]), state)
			.pipe(applyCollisionDetectionDelta, delta);
	}],
	["GAME_CreateExplosion", (state, action) => Seq(applyExplosionForce(state, action.position, action.magnitude)).reduce((state, actions) => actions.reduce((state, action) => applyPhysicsForceReducer(state, action), state), state)]
);

const reducer = (state: GameState, action: GameAction): GameState => state
	.pipe(physicsIntegratorReducer, action)
	.pipe(constrainedPhysics, action)
	.pipe(entityComponentReducer, action);

const render = (state: GameState): FrameCollection => {
	return [
		Clear,
		Origin({ x: 320, y: 240 }, [
			Array.from(renderCollisionMaps(state))
		])
	];
};

const onCollision = (state: GameState, lhs: EntityId, rhs: EntityId): GameState => {
	const lhsEntity = state.entities.at(lhs)!;
	const rhsEntity = state.entities.at(rhs)!;
	const lhsPhysical = lhsEntity.components.at("PHYS_PhysicsPhysicalComponent")! as PhysicsPhysicalComponent;
	const rhsPhysical = rhsEntity.components.at("PHYS_PhysicsPhysicalComponent")! as PhysicsPhysicalComponent;
	const force = Vector2.magnitude(Vector2.add(lhsPhysical.properties.velocity, rhsPhysical.properties.velocity));
	const angleBetween = Vector2.subtract(rhsPhysical.properties.velocity, lhsPhysical.properties.velocity)
	const newForceRight = Vector2.multiply(Vector2.normalise(angleBetween), force / 2);
	const newForceLeft = Vector2.invert(newForceRight);
	return [
		PhysicsApplyForceAction(rhs, newForceLeft),
		PhysicsApplyForceAction(lhs, newForceRight)
	].reduce((state, action) => applyPhysicsForceReducer(state, action), state);
};

const epic = (action$: Observable<GameAction>): Observable<GameAction> => {
	return merge(
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.DownArrow)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(0, 290), magnitude: 1000 }) as GameAction),
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.UpArrow)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(0, -290), magnitude: 1000 }) as GameAction),
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.LeftArrow)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(-360, 0), magnitude: 1000 }) as GameAction),
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.RightArrow)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(360, 0), magnitude: 1000 }) as GameAction),
		action$
			.filter(action => SystemAction.KeyDown(action) && action.key === Key.Space)
			.map(() => ({ type: "GAME_CreateExplosion", position: Point2(0, 0), magnitude: 1000 }) as GameAction)
	);
};

const applyExplosionForce = createEntitiesStateMap(["PHYS_PhysicsPhysicalComponent"], (entityId: EntityId, physical: PhysicsPhysicalComponent, position: Point2, magnitude: number) => {
	const distance = Vector2.subtract(physical.properties.position, position);
	return (Vector2.magnitudeSquared(distance) <= magnitude * magnitude)
		? [PhysicsApplyForceAction(entityId, Vector2.multiply(Vector2.normalise(distance), magnitude - Vector2.magnitude(distance)))]
		: [];
});

export const app = {
	epic,
	initialState,
	reducer,
	render
};
