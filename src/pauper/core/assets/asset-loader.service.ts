import { ImageAsset } from "./asset.model";

export abstract class AssetLoader {
	public abstract getImage(id: string, path?: string): ImageAsset;
	public abstract loadImage(id: string, path?: string): Promise<ImageAsset>;
}
