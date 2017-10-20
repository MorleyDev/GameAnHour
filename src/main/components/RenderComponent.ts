export type RenderComponent = {
	readonly name: "RenderComponent";
	readonly colour: string;
};
export const RenderComponent: "RenderComponent" = "RenderComponent";

export const CreateRenderComponent = (colour: string): RenderComponent => ({ name: "RenderComponent", colour });
