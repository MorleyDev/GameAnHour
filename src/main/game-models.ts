import { BaseComponent } from "../entity-component/component-base.type";
import { Entity } from "../entity-component/entity.type";
import { GenericAction } from "../functional/generic.action";

export type GameComponent = BaseComponent;

export type GameEntity = Entity<GameComponent>;

export const GameEntity = (name: string, ...components: GameComponent[]) => Entity<GameComponent>(name, ...components);

export type GameAction = GenericAction;
