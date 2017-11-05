import { EntityId } from "../../ecs/entity-base.type";
import { EntityComponentReducerEvents } from "../../ecs/entity-component.reducer";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { StaticBodyComponent } from "../component/StaticBodyComponent";

export const createPhysicsEcsEvents = (
	attachHardBodyToPhysics: (entityId: EntityId, component: HardBodyComponent) => HardBodyComponent,
	attachStaticBodyToPhysics: (entityId: EntityId, component: StaticBodyComponent) => StaticBodyComponent,
	detachHardBodyToPhysics: (entityId: EntityId, component: HardBodyComponent) => void,
	detachStaticBodyToPhysics: (entityId: EntityId, component: StaticBodyComponent) => void
): EntityComponentReducerEvents => ({
	attach(entityId, c) {
		switch (c.name) {
			case "HardBodyComponent": {
				const component = c as HardBodyComponent;
				return attachHardBodyToPhysics(entityId, component);
			}

			case "StaticBodyComponent": {
				const component = c as StaticBodyComponent;
				return attachStaticBodyToPhysics(entityId, component);
			}

			default: {
				return c;
			}
		}
	},
	detach(entityId, c) {
		switch (c.name) {
			case "HardBodyComponent": {
				const component = c as HardBodyComponent;
				detachHardBodyToPhysics(entityId, component);
			}

			case "StaticBodyComponent": {
				const component = c as StaticBodyComponent;
				detachStaticBodyToPhysics(entityId, component);
			}
		}
	}
});