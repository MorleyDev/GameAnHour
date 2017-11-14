import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset } from "./asset.model";

export class NoOpAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private audio: { [id: string]: SoundEffectAsset | undefined } = {};

	public loadFont(id: string, path?: string): Promise<void> {
		return Promise.resolve();
	}

	public getSoundEffect(id: string, path?: string): SoundEffectAsset {
		return { } as any;
	}

	public loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset> {
		return Promise.resolve({ } as any);
	}

	public getImage(id: string, path?: string): ImageAsset {
		return { } as any;
	}

	public async loadImage(id: string, path: string): Promise<ImageAsset> {
		return Promise.resolve({ } as any);
	}
}
