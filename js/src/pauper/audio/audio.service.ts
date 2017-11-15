import { MusicAsset, SoundEffectAsset } from "../assets/asset.model";

export abstract class AudioService {
	public abstract playSoundEffect(audio: SoundEffectAsset, volume: number): AudioService;

	public abstract playMusic(audio: MusicAsset, volume: number, loop: boolean): AudioService;
	public abstract pauseMusic(audio: MusicAsset): AudioService;
	public abstract stopMusic(audio: MusicAsset): AudioService;
}
