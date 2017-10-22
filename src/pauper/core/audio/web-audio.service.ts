import { AudioAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class WebAudioService implements AudioService {
	public play(audio: AudioAsset): this {
		if (!audio.playing()) {
			audio.play();
		}
		return this;
	}

	public stop(audio: AudioAsset): this {
		if (audio.playing()) {
			audio.stop();
		}
		return this;
	}

	public pause(audio: AudioAsset): this {
		if (audio.playing()) {
			audio.pause();
		}
		return this;
	}
}
