import { SoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class NoOpAudioService implements AudioService {
	public playSoundEffect(audio: SoundEffectAsset): this {
		return this;
	}
}
