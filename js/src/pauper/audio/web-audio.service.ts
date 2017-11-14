import { SoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class WebAudioService implements AudioService {
	public playSoundEffect(audio: SoundEffectAsset): this {
		(audio as Howl).play();
		return this;
	}
}
