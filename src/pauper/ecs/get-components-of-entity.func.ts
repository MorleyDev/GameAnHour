import { BaseComponent } from "./component-base.type";
import { BaseEntity } from "./entity-base.type";

type EntitiesStateFilter
	= ((component: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, component3: BaseComponent<string, any>, ..._extra: any[]) => boolean);

export function getComponentsOfEntity(withComponents: ReadonlyArray<string>): (state: BaseEntity) => ReadonlyArray<BaseComponent<string, any>[]> {
	return (entity: BaseEntity): ReadonlyArray<BaseComponent<string, any>[]> => withComponents.map(component => entity.components[component] as BaseComponent<string, any>);
}
