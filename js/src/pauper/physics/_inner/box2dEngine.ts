import { EntityId } from "../../ecs/entity-base.type";
import { EntityComponentReducerEvents } from "../../ecs/entity-component.reducer";
import { Circle, Rectangle, Shape2 } from "../../models/shapes.model";
import { Seconds } from "../../models/time.model";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { StaticBodyComponent } from "../component/StaticBodyComponent";
import { createPhysicsEcsEvents } from "../reducer/ecs-events.func";
import { createPhysicsReducer } from "../reducer/physics-body.reducer";
import { PhysicsUpdateResult } from "../update.model";
import { Collision } from "../collision.model";

const applyForce = (component: HardBodyComponent): HardBodyComponent => {
	if (component.pendingForces.length === 0) {
		return component;
	} else {
		for (const f of component.pendingForces) {
			// TODO
		}
		return {
			...component,
			pendingForces: []
		};
	}
};

const bodyEntityIdMap: { [body: number]: EntityId | undefined } = { };

const attachHardBodyToPhysics = (entityId: EntityId, component: HardBodyComponent): HardBodyComponent => {
	const shape = Shape2.add(component.shape, component.position);
	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			component._body = BOX2D_CreateBody_Tri(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, false, component.density, 1, component.elasticity);
		} else {
			// TODO: return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], props);
		}
	} else if (Rectangle.is(shape)) {
		component._body = BOX2D_CreateBody_Box(shape.x, shape.y, shape.width, shape.height, false, component.density, 1, component.elasticity);
	} else if (Circle.is(shape)) {
		component._body = BOX2D_CreateBody_Ball(shape.x, shape.y, shape.radius, false, component.density, 1, component.elasticity);
	} else {
		throw new Error();
	}
	bodyEntityIdMap[component._body] = entityId;
	return component;
};

const attachStaticBodyToPhysics = (entityId: EntityId, component: StaticBodyComponent): StaticBodyComponent => {
	const shape = Shape2.add(component.shape, component.position);
	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			component._body = BOX2D_CreateBody_Tri(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, true, 0, 1, 0);
		} else {
			throw new Error();
			// TODO: return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], props);
		}
	} else if (Rectangle.is(shape)) {
		component._body = BOX2D_CreateBody_Box(shape.x, shape.y, shape.width, shape.height, true, 0, 1, 0);
	} else if (Circle.is(shape)) {
		component._body = BOX2D_CreateBody_Ball(shape.x, shape.y, shape.radius, true, 0, 1, 0);
	} else {
		throw new Error();
	}
	bodyEntityIdMap[component._body] = entityId;
	return component;
};

const syncComponent = (hardbody: HardBodyComponent): HardBodyComponent => {
	if (hardbody._body == null) {
		return hardbody;
	}

	const body = BOX2D_GetBody(hardbody._body);
	const speedSquared = body.velocityX * body.velocityX + body.velocityY * body.velocityY;
	const angularSpeedSquared = body.angularVelocity * body.angularVelocity;
	const motion = speedSquared + angularSpeedSquared;
	const isResting = motion < 1;

	return {
		...hardbody,
		isResting,
		position: {
			x: body.positionX,
			y: body.positionY
		},
		velocity: {
			x: body.velocityX,
			y: body.velocityY,
		},
		angularVelocity: body.angularVelocity,
		rotation: body.angle
	};
};

const detachPhysics = (id: EntityId, component: HardBodyComponent | StaticBodyComponent) => {
	BOX2D_DestroyBody(component._body);
	bodyEntityIdMap[component._body] = undefined;
};

export const box2dPhysicsEcsEvents: EntityComponentReducerEvents = createPhysicsEcsEvents(
	attachHardBodyToPhysics,
	attachStaticBodyToPhysics,
	detachPhysics,
	detachPhysics
);

export const box2dAdvancePhysicsEngine = (deltaTime: Seconds): PhysicsUpdateResult => {
	BOX2D_Advance(deltaTime);

	const collisionStarts: Collision[] = Array( BOX2D_GetCollisionStartCount() );
	for (let i = 0; i < collisionStarts.length; ++i) {
		const collision = BOX2D_PullCollisionStart()!;
		collisionStarts[i] = {
			a: bodyEntityIdMap[collision.a]!,
			b: bodyEntityIdMap[collision.b]!,
		};
	}

	const collisionEnds: Collision[] = Array( BOX2D_GetCollisionEndCount() );
	for (let i = 0; i < collisionEnds.length; ++i) {
		const collision = BOX2D_PullCollisionEnd()!;
		collisionEnds[i] = {
			a: bodyEntityIdMap[collision.a]!,
			b: bodyEntityIdMap[collision.b]!,
		};
	}
	return { collisionStarts, collisionEnds };
};

export const box2dPhysicsReducer = createPhysicsReducer(box2dAdvancePhysicsEngine, syncComponent, applyForce);

BOX2D_SetGravity(0.0, 980.0);
