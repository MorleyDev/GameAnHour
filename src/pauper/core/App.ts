import { Renderer } from "./graphics/renderer.service";
import { Seconds } from "./models/time.model";

export abstract class App {
	public abstract update(deltaTime: Seconds): void;
	public abstract draw(canvas: Renderer): void;

	public abstract hot(data: any): void;
}
