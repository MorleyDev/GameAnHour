import { AssetLoader } from "./asset-loader.service";
import { Image } from "./asset.model";

export class WebAssetLoader implements AssetLoader {
	private images: { [id: string]: Image | undefined } = {};

	public getImage(id: string, path?: string): Image {
		const image = this.images[id];
		if (image) {
			return image;
		}

		const img = new Image();
		img.src = path || `./assets/${id}.png`;
		return img;
	}

	public loadImage(id: string, path: string): Promise<Image> {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.images[id] = img;
				resolve(img);
			};
			img.onerror = () => {
				reject();
			};
			img.src = path;
		});
	}
}
