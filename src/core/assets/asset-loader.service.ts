import { Image } from "./asset.model";

export abstract class AssetLoader {
	public abstract getImage(id: string, path?: string): Image;
	public abstract loadImage(id: string, path?: string): Promise<Image>;
}
