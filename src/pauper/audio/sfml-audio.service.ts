import { SoundEffectAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class SfmlAudioService implements AudioService {
	public playSoundEffect(audio: SoundEffectAsset): this {
		const soundEffect = audio as { readonly name: string; readonly src: string };
		SFML_PlaySound(soundEffect.name);
		return this;
	}
}
