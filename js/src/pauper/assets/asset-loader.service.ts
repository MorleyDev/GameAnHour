import { ImageAsset, MusicAsset, SoundEffectAsset } from "./asset.model";

export abstract class AssetLoader {
	public abstract loadFont(id: string, path?: string): Promise<void>;

	public abstract getImage(id: string, path?: string): ImageAsset;
	public abstract loadImage(id: string, path?: string): Promise<ImageAsset>;

	public abstract getSoundEffect(id: string, path?: string): SoundEffectAsset;
	public abstract loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset>;

	public abstract getMusic(id: string, path?: string): MusicAsset;
	public abstract loadMusic(id: string, path: string): Promise<MusicAsset>;
}
