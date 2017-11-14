import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset, MusicAsset } from "./asset.model";

export class SfmlAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private soundeffects: { [id: string]: SoundEffectAsset | undefined } = {};
	private music: { [id: string]: MusicAsset | undefined } = {};

	public loadFont(id: string, path?: string): Promise<void> {
		SFML_LoadFont(id, path || `./assets/fonts/${id}.ttf`);
		return Promise.resolve();
	}

	public getSoundEffect(id: string, path?: string): SoundEffectAsset {
		let asset = this.soundeffects[id];
		if (asset == null) {
			asset = this.soundeffects[id] = SFML_LoadSound(id, path || `./assets/${id}.ogg`);
		}
		return asset;
	}

	public loadSoundEffect(id: string, path: string): Promise<SoundEffectAsset> {
		let asset = this.soundeffects[id];
		if (asset == null) {
			asset = this.soundeffects[id] = SFML_LoadSound(id, path || `./assets/${id}.ogg`);
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

	public getMusic(id: string, path?: string): MusicAsset {
		let asset = this.music[id];
		if (asset == null) {
			asset = this.music[id] = SFML_LoadMusic(id, path || `./assets/${id}.ogg`);
		}
		return asset;
	}

	public async loadMusic(id: string, path: string): Promise<MusicAsset> {
		let asset = this.music[id];
		if (asset == null) {
			asset = this.music[id] = SFML_LoadMusic(id, path || `./assets/${id}.ogg`);
		}
		return Promise.resolve(asset);
	}
}
