import { AudioAsset, ImageAsset } from "./asset.model";

export abstract class AssetLoader {
	public abstract getImage(id: string, path?: string): ImageAsset;
	public abstract loadImage(id: string, path?: string): Promise<ImageAsset>;

	public abstract getAudio(id: string, path?: string): AudioAsset;
	public abstract loadAudio(id: string, path: string): Promise<AudioAsset>;
}
