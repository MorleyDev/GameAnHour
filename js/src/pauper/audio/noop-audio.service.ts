import { SoundEffectAsset, MusicAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class NoOpAudioService implements AudioService {
	public playSoundEffect(audio: SoundEffectAsset, volume: number): this {
		return this;
	}

	public playMusic(audio: MusicAsset, volume: number, loop: boolean): AudioService {
		return this;
	}

	public pauseMusic(audio: MusicAsset): AudioService {
		return this;
	}

	public stopMusic(audio: MusicAsset): AudioService {
		return this;
	}
}
