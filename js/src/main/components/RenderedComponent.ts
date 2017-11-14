import { BaseComponent } from "../../pauper/ecs/component-base.type";
import { Colour } from "../../pauper/models/colour.model";

export type RenderedComponent = BaseComponent<"RenderedComponent", { readonly rgb: Colour }>;

export const RenderedComponent = (red: number, green: number, blue: number) => BaseComponent("RenderedComponent", { rgb: Colour(red, green, blue) });
