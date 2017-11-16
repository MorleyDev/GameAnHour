import { BaseComponent } from "../../pauper/ecs/component-base.type";
import { RGBA, RGB } from "../../pauper/models/colour.model";

export type RenderedComponent = BaseComponent<"RenderedComponent", { readonly rgb: RGB }>;

export const RenderedComponent = (red: number, green: number, blue: number) => BaseComponent("RenderedComponent", { rgb: RGB(red, green, blue) });
