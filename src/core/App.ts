import { Renderer } from "./canvas/renderer.service";

export abstract class App {
	public abstract update(deltaTimeS: number): void;
	public abstract draw(canvas: Renderer): void;
}
