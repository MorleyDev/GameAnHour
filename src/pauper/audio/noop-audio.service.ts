import { SoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class NoOpAudioService implements AudioService {
	public play(audio: SoundEffectAsset): this {
		return this;
	}

	public stop(audio: SoundEffectAsset): this {
		return this;
	}

	public pause(audio: SoundEffectAsset): this {
		return this;
	}
}
