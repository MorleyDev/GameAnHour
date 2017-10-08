import { BaseComponent } from "../entity-component/component-base.type";
import { EntitiesState } from "../entity-component/entities.state";
import { Entity } from "../entity-component/entity.type";
import { GenericAction } from "../functional/generic.action";
import { SystemState } from "../functional/system.state";
import { PhysicsState } from "./physics/physics-state";

export type GameState = EntitiesState & SystemState & PhysicsState;

export type GameComponent = BaseComponent;

export type GameEntity = Entity<GameComponent>;

export const GameEntity = (name: string, ...components: GameComponent[]) => Entity<GameComponent>(name, ...components);

export type GameAction = GenericAction;
