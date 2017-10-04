import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { magnitude, multiply, normalise, subtract } from "../core/maths/vector.maths.func";
import { Point2 } from "../core/models/point/point.model";
import { Rectangle } from "../core/models/rectangle/rectangle.model";
import { Circle, Shape2 } from "../core/models/shapes.model";
import { Seconds } from "../core/models/time.model";
import { RenderComponent } from "../entity-component/component-render.type";
import { EntitiesState } from "../entity-component/entities.state";
import { entityComponentEpic } from "../entity-component/entity-component.epic";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { entityComponentRender } from "../entity-component/entity-component.render";
import { entityComponentTick } from "../entity-component/entity-component.tick";
import { Entity } from "../entity-component/entity.type";
import { GenericAction } from "../functional/generic.action";
import { Clear, Frame } from "../functional/render-frame.model";
import { Fill, FrameCollection, Origin } from "../functional/render-frame.model";
import { SystemState } from "../functional/system.state";
import { PhysicsCollidableComponent } from "./physics/physics-collidable.component";
import { PhysicsObjectComponent } from "./physics/physics-object.component";
import { ApplyForceAction, PhysicsAction } from "./physics/physics.actions";
import { physicsReducer } from "./physics/physics.reducer";
import { PhysicsState } from "./physics/physics.state";
import { physicsTick } from "./physics/physics.tick";

class RenderPhysicsMeshComponent implements RenderComponent<"RenderPhysicsMeshComponent"> {
	public readonly name = "RenderPhysicsMeshComponent";

	constructor(private colour: string) {
	}

	public render(self: Entity): Frame {
		const collisionObject = self.components.at("PHYSICS_COLLIDABLE") as PhysicsCollidableComponent | undefined;
		const physObject = self.components.at("PHYSICS_OBJECT") as PhysicsObjectComponent | undefined;
		if (collisionObject == null) {
			return [];
		}

		const position = physObject != null ? physObject.data.position : Point2(0, 0);
		const collisionMesh = collisionObject.data.mesh;
		return collisionMesh
			.map(mesh => Shape2.add(mesh, position))
			.map(mesh => Fill(mesh, this.colour));
	}
}

type GameTick = (tick$: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GenericAction>;
export const gameTick: GameTick = tick$ => merge(
	physicsTick(tick$),
	entityComponentTick(tick$)
);

type GameState = PhysicsState & SystemState;
export const initialState: GameState = {}
	.pipe(SystemState)
	.pipe(EntitiesState, [
		createPaddle(),
		createBall()
	])
	.pipe(PhysicsState);

type GameRender = (state: GameState) => FrameCollection;
export const gameRender: GameRender = state => Frame(
	Clear,
	Origin(Point2(320, 240), [
		...entityComponentRender(state)
	])
);

type GameReducer = (state: GameState, curr: GenericAction) => GameState;
export const gameReducer: GameReducer = (state, action) => state
	.pipe(entityComponentReducer, action)
	.pipe(physicsReducer, action)
	.pipe((state, action) => state, action);

type GameEpic = (action$: Observable<GenericAction>, state: () => GameState) => Observable<GenericAction>;
export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state),
	action$
		.filter(PhysicsAction.ActiveCollisionsChangedAction)
		.map(action => action.detected)
		.mergeMap(detected => detected.concat( detected.map(flip)) )
		.map(collision => ({ entity: collision[0], velocity: getVelocity(collision[0]), angle: getAngleOfCollisionBetweenEntities(collision[0], collision[1]) }))
		.map(({ entity, velocity, angle }) => ApplyForceAction(getReboundForce(entity, velocity, angle), entity.id))
);

function flip<T, U>([t, u]: [T, U]): [U, T] {
	return [u, t];
}

function getVelocity(entity: Entity): Vector2 {
	const phys = entity.components.at("PHYSICS_OBJECT") as PhysicsObjectComponent | undefined;
	return phys != null ? phys.data.velocity : Vector2(0, 0);
}

function getReboundForce(entity: Entity, force: Vector2, angle: Vector2): Vector2 {
	return multiply(angle, -magnitude(force) * 2);
}

function getAngleOfCollisionBetweenEntities(a: Entity, b: Entity) {
	const lhs = a.components.at("PHYSICS_OBJECT") as PhysicsObjectComponent | undefined;
	const rhs = b.components.at("PHYSICS_OBJECT") as PhysicsObjectComponent | undefined;
	if (lhs == null || rhs == null) {
		return Vector2(0, 0);
	}

	return getAngleOfCollision(lhs, rhs);
}

function getAngleOfCollision(lhs: PhysicsObjectComponent, rhs: PhysicsObjectComponent) {
	return normalise(subtract(rhs.data.position, lhs.data.position));
}

function createPaddle(): Entity {
	return Entity(
		PhysicsCollidableComponent([ Rectangle(-20, -5, 40, 10) ]),
		PhysicsObjectComponent(Point2(0, 200), Vector2(0, 0)),
		new RenderPhysicsMeshComponent("lightblue"),
	);
}

function createBall(): Entity {
	return Entity(
		PhysicsCollidableComponent([ Circle(0, 0, 20) ]),
		PhysicsObjectComponent(Point2(0, -200), Vector2(0, 0)),
		new RenderPhysicsMeshComponent("lightblue"),
		{
			name: "PONG_OnGameStart",
			transform: (self, action) => action.type === "PONG_OnGameStart" ? [ ApplyForceAction(Vector2(0, 100), self.id) ] : []
		}
	);
}
