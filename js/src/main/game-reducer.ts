import { PhysicsDrivers } from "../pauper/app-drivers";
import { createEntitiesStateFilter } from "../pauper/ecs/create-entities-state-filter.func";
import { EntityId } from "../pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/ecs/entity-component.actions";
import { createEntityComponentReducer } from "../pauper/ecs/entity-component.reducer";
import { Vector2 } from "../pauper/maths/vector.maths";
import { Shape2 } from "../pauper/models/shapes.model";
import { HardBodyComponent } from "../pauper/physics/component/HardBodyComponent";
import { FloatingScoreComponent } from "./components/FloatingScoreComponent";
import { ScoreBucketComponent } from "./components/ScoreBucketComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { GameAction, GameState } from "./game.model";

const deadPhysicsEntities = createEntitiesStateFilter(["HardBodyComponent"], (component: HardBodyComponent) => component.position.y > 1000);
const restingPhysicsEntities = createEntitiesStateFilter(["HardBodyComponent"], (component: HardBodyComponent) => component.restingTime >= 2);
const fadedAwayTextBoxes = createEntitiesStateFilter(["FloatingScoreComponent"], (component: FloatingScoreComponent, currentTick: number) => currentTick > component.startingTick + component.lifespan);

export const reducer = (drivers: PhysicsDrivers) => {
	const physicsReducer = drivers.physics.reducer<GameState, GameAction>((state, result) => ({
		...state,
		effects: state.effects
			.concat(result.collisionStarts.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
			.concat(result.collisionEnds.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
	}));

	const entityComponentReducer = createEntityComponentReducer(drivers.physics.events);

	return (state: GameState, action: GameAction): GameState => {
		switch (action.type) {
			case "@@TICK":
				const readyToRemoveBoxes = Array.from(fadedAwayTextBoxes(state, state.runtime)).map(e => DestroyEntityAction(e) as GameAction);
				const readyToFinishBalls = Array.from(restingPhysicsEntities(state)).map(ball => ({ type: "BALL_FINISHED", ball } as GameAction));
				const effects = readyToRemoveBoxes.concat(readyToFinishBalls);

				return {
					...state,
					runtime: state.runtime + action.deltaTime,
					effects: state.effects.concat(effects)
				};

			case "@@COLLISION_START":
				if ((state.componentEntityLinks["HardBodyComponent"] || []).some(e => e === action.collision.a || e === action.collision.b)) {
					return {
						...state,
						effects: state.effects.concat({ type: "PlaySoundEffect", sound: "boing" } as GameAction)
					};
				}
				return state;

			case "BALL_FINISHED":
				const ballHardBodyComponent = state.entities[action.ball].components["HardBodyComponent"] as HardBodyComponent;
				const bucket = (state.componentEntityLinks["SensorPhysicsComponent"] || [])
					.find(bucket => {
						const sensor = (state.entities[bucket].components["SensorPhysicsComponent"] as SensorPhysicsComponent);
						return Shape2.collision(sensor.shape, Shape2.add(ballHardBodyComponent.shape, ballHardBodyComponent.position));
					});

				const bucketValue = bucket != null
					? (state.entities[bucket].components["ScoreBucketComponent"] as ScoreBucketComponent).value
					: 0;

				const entityId = EntityId();

				return {
					...state,
					score: state.score + bucketValue,
					effects: state.effects.concat([
						DestroyEntityAction(action.ball),
						CreateEntityAction(entityId),
						AttachComponentAction(entityId, FloatingScoreComponent(bucketValue, Vector2.subtract(ballHardBodyComponent.position, Vector2(5, 30)), state.runtime))
					])
				};

			default:
				return physicsReducer(entityComponentReducer(state, action), action);
		}
	};
};

export const postprocess = (state: GameState): {
	readonly state: GameState;
	readonly actions: ReadonlyArray<GameAction>;
} => ({
	state: {
		...state,
		effects: []
	},
	actions: state.effects
});
