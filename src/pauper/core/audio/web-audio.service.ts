import { SoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class WebAudioService implements AudioService {
	public play(audio: SoundEffectAsset): this {
		audio.play();
		return this;
	}

	public stop(audio: SoundEffectAsset): this {
		audio.stop();
		return this;
	}

	public pause(audio: SoundEffectAsset): this {
		audio.pause();
		return this;
	}
}
