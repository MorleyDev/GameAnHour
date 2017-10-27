import { BaseComponent } from "../../pauper/ecs/component-base.type";

export type PegComponent = BaseComponent<"PegComponent">;

export const PegComponent = () => BaseComponent("PegComponent", {});
