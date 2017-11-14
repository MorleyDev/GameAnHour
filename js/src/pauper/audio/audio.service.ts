import { MusicAsset, SoundEffectAsset } from "../assets/asset.model";

export abstract class AudioService {
	public abstract playSoundEffect(audio: SoundEffectAsset): AudioService;

	public abstract playMusic(audio: MusicAsset, loop: boolean): AudioService;
	public abstract pauseMusic(audio: MusicAsset): AudioService;
	public abstract stopMusic(audio: MusicAsset): AudioService;
}
