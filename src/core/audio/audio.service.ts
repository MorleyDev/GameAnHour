import { AudioAsset } from "../assets/asset.model";

export abstract class AudioService {
	public abstract play(audio: AudioAsset): AudioService;
	public abstract stop(audio: AudioAsset): AudioService;
	public abstract pause(audio: AudioAsset): AudioService;
}
