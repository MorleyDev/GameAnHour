import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset } from "./asset.model";

export class SfmlAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private audio: { [id: string]: SoundEffectAsset | undefined } = {};

	public loadFont(id: string, path?: string): Promise<void> {
		SFML_LoadFont(id, path || `./assets/fonts/${id}.ttf`);
		return Promise.resolve();
	}

	public getSoundEffect(id: string, path?: string): SoundEffectAsset {
		let asset = this.audio[id];
		if (asset == null) {
			asset = this.audio[id] = SFML_LoadSound(id, path || `./assets/${id}.ogg`);
		}
		return asset;
	}

	public loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset> {
		let asset = this.audio[id];
		if (asset == null) {
			asset = this.audio[id] = SFML_LoadSound(id, path || `./assets/${id}.ogg`);
		}
		return Promise.resolve(asset);
	}

	public getImage(id: string, path?: string): ImageAsset {
		let asset = this.images[id];
		if (asset == null) {
			asset = this.images[id] = SFML_LoadImage(id, path || `./assets/${id}.png`);
		}
		return asset;
	}

	public async loadImage(id: string, path: string): Promise<ImageAsset> {
		let asset = this.images[id];
		if (asset == null) {
			asset = this.images[id] = SFML_LoadImage(id, path || `./assets/${id}.png`);
		}
		return Promise.resolve(asset);
	}
}
