import { BaseComponent } from "./component-base.type";
import { BaseEntity } from "./entity-base.type";
import { map } from "../iterable/operators";

type EntitiesStateFilter
	= ((component: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, component3: BaseComponent<string, any>, ..._extra: any[]) => boolean);

export function getComponentsOfEntity(withComponents: ReadonlyArray<string>): (state: BaseEntity) => Iterable<BaseComponent<string, any>[]> {
	return entity => withComponents.map((component: string) => entity.components[component] as BaseComponent<string, any>);
}
