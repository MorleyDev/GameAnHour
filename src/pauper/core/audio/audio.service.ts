import { SoundEffectAsset } from "../assets/asset.model";

export abstract class AudioService {
	public abstract play(audio: SoundEffectAsset): AudioService;
	public abstract stop(audio: SoundEffectAsset): AudioService;
	public abstract pause(audio: SoundEffectAsset): AudioService;
}
