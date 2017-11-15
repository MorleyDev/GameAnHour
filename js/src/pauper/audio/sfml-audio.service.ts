import { SoundEffectAsset, MusicAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class SfmlAudioService implements AudioService {
	public playMusic(audio: MusicAsset, volume: number, loop: boolean): AudioService {
		SFML_PlayMusic(audio.name, volume, loop);
		return this;
	}

	public pauseMusic(audio: MusicAsset): AudioService {
		SFML_PauseMusic(audio.name);
		return this;
	}

	public stopMusic(audio: MusicAsset): AudioService {
		SFML_StopMusic(audio.name);
		return this;
	}

	public playSoundEffect(audio: SoundEffectAsset, volume: number): this {
		const soundEffect = audio as { readonly name: string; readonly src: string };
		SFML_PlaySound(soundEffect.name, volume);
		return this;
	}
}
