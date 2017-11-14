import { SoundEffectAsset } from "../assets/asset.model";

export abstract class AudioService {
	public abstract playSoundEffect(audio: SoundEffectAsset): AudioService;
}
