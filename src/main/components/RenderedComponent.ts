import { BaseComponent } from "../../pauper/entity-component/component-base.type";

export type RenderedComponent = BaseComponent<"RenderedComponent", { readonly rgb: string }>;

export const RenderedComponent = (red: number, green: number, blue: number) => BaseComponent("RenderedComponent", { rgb: `${red}, ${green}, ${blue}` });
