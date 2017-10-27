import { BaseComponent } from "../../pauper/entity-component/component-base.type";

export type PegComponent = BaseComponent<"PegComponent">;

export const PegComponent = () => BaseComponent("PegComponent", {});
