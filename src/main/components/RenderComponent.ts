export type RenderComponent = { name: "RenderComponent"; colour: string; };
export const RenderComponent: "RenderComponent" = "RenderComponent";

export const CreateRenderComponent = (colour: string): RenderComponent => ({ name: "RenderComponent", colour });
