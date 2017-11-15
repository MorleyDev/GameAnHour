import { AssetLoader } from "./asset-loader.service";
import { ImageAsset, SoundEffectAsset, MusicAsset } from "./asset.model";

let loaderId: number = 0;
const loaderCallback: { [id: number]: (() => void) | ((width: number, height: number) => void) | undefined } = {};

SFML_OnLoadImage = (id: number, width: number, height: number) => ((loaderCallback[id] as (width: number, height: number) => void) || ((w, h) => { }))(width, height);
SFML_OnLoadFont = (id: number) => (loaderCallback[id] as () => void)();
SFML_OnLoadSound = (id: number) => (loaderCallback[id] as () => void)();

export class SfmlAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private soundeffects: { [id: string]: SoundEffectAsset | undefined } = {};
	private music: { [id: string]: MusicAsset | undefined } = {};

	constructor() {
	}

	public loadFont(name: string, path?: string): Promise<void> {
		return new Promise<void>(resolve => {
			const id = loaderId++;
			loaderCallback[id] = () => {
				resolve();
				loaderCallback[id] = undefined;
			};
			SFML_LoadFont(name, path || `./assets/fonts/${name}.ttf`, id);
		});
	}

	public getSoundEffect(name: string, path?: string): SoundEffectAsset {
		const asset = this.soundeffects[name];
		if (asset != null) {
			return asset;
		} else {
			this.loadSoundEffect(name, path || `./assets/${name}.ogg`);
			return this.soundeffects[name]!;
		}
	}

	public loadSoundEffect(name: string, path: string): Promise<SoundEffectAsset> {
		return new Promise<SoundEffectAsset>((resolve) => {
			const asset = this.soundeffects[name];
			if (asset != null) {
				resolve(asset);
			} else {
				const id = loaderId++;
				loaderCallback[id] = () => {
					resolve(this.soundeffects[name]!);
					loaderCallback[id] = undefined;
				};
				this.soundeffects[name] = SFML_LoadSound(name, path, id);
			}
			return Promise.resolve(asset);
		});
	}

	public getImage(name: string, path?: string): ImageAsset {
		const asset = this.images[name];
		if (asset != null) {
			return asset;
		} else {
			this.loadImage(name, path || `./assets/${name}.png`);
			return this.images[name]!;
		}
	}

	public async loadImage(name: string, path: string): Promise<ImageAsset> {
		return new Promise<ImageAsset>((resolve) => {
			const asset = this.images[name];
			if (asset != null) {
				resolve(asset);
			} else {
				const id = loaderId++;
				loaderCallback[id] = (width, height) => {
					resolve(this.images[name] = {
						...this.images[name]!,
						width,
						height
					});
					loaderCallback[id] = undefined;
				};
				this.images[name] = SFML_LoadImage(name, path || `./assets/${name}.png`, id);
			}
		});
	}

	public getMusic(name: string, path?: string): MusicAsset {
		let asset = this.music[name];
		if (asset == null) {
			asset = this.music[name] = SFML_LoadMusic(name, path || `./assets/${name}.ogg`);
		}
		return asset;
	}

	public async loadMusic(name: string, path: string): Promise<MusicAsset> {
		let asset = this.music[name];
		if (asset == null) {
			asset = this.music[name] = SFML_LoadMusic(name, path || `./assets/${name}.ogg`);
		}
		return Promise.resolve(asset);
	}
}
