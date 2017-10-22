import { Howl } from "howler";

import { AssetLoader } from "./asset-loader.service";
import { AudioAsset, ImageAsset } from "./asset.model";

export class WebAssetLoader implements AssetLoader {
	private images: { [id: string]: ImageAsset | undefined } = {};
	private audio: { [id: string]: AudioAsset | undefined } = {};

	public getAudio(id: string, path?: string): AudioAsset {
		const audio = this.audio[id];
		if (audio) {
			return audio;
		} else {
			const howl = new Howl({ src: path || [`./assets/${id}.ogg`, `./assets/${id}.flac`, `./assets/${id}.mp3`, `./assets/${id}.wav`] });
			this.audio[id] = howl;
			return howl;
		}
	}

	public async loadAudio(id: string, path: string): Promise<AudioAsset> {
		const audio = this.audio[id];
		if (audio) {
			return audio;
		} else {
			const howl = await loadAudioFromUrl(path);
			this.audio[id] = howl;
			return howl;
		}
	}

	public getImage(id: string, path?: string): ImageAsset {
		const image = this.images[id];
		if (image != null) {
			return image;
		} else {
			const img = new Image();
			img.src = path || `./assets/${id}.png`;
			this.images[id] = img;
			return img;
		}
	}

	public async loadImage(id: string, path: string): Promise<ImageAsset> {
		const imageAlreadyLoaded = this.images[id];
		if (imageAlreadyLoaded != null) {
			return imageAlreadyLoaded;
		} else {
			const image = await loadImageFromUrl(path);
			this.images[id] = image;
			return image;
		}
	}
}

function loadImageFromUrl(path: string): Promise<HTMLImageElement> {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject();
		img.src = path;
	});
}

function loadAudioFromUrl(path: string): Promise<Howl> {
	return new Promise<Howl>((resolve, reject) => {
		const howl = new Howl({ src: [path], html5: true });
		if (howl.state() === "loaded") {
			return howl;
		} else {
			howl.once("load", () => resolve(howl));
			howl.once("loaderror", (id, err) => reject(err));
			howl.load();
			return howl;
		}
	});
}
