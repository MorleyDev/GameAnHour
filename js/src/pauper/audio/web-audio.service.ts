import { SoundEffectAsset, MusicAsset } from "../assets/asset.model";
import { AudioService } from "./audio.service";

export class WebAudioService implements AudioService {
	private playingMusic: string[] = [];
	private pausedMusic: string[] = [];

	public playSoundEffect(audio: SoundEffectAsset, volume: number): this {
		const howl = this.getHowl(audio);
		howl.volume(volume);
		howl.play();
		return this;
	}

	public playMusic(audio: MusicAsset, volume: number, loop: boolean): AudioService {
		const howl = this.getHowl(audio);
		howl.volume(volume);
		howl.loop(loop);
		if (!this.playingMusic.includes(audio.name)) {
			howl.play();
			howl.once("end", () => {
				this.playingMusic = this.playingMusic.filter(m => m !== audio.name);
			});
			this.playingMusic.push(audio.name);
		}
		return this;
	}

	public pauseMusic(audio: MusicAsset): AudioService {
		const howl = this.getHowl(audio);
		if (!this.playingMusic.includes(audio.name)) {
			return this;
		}
		howl.pause();
		this.playingMusic = this.playingMusic.filter(m => m !== audio.name);
		this.pausedMusic.push(audio.name);
		return this;
	}

	public stopMusic(audio: MusicAsset): AudioService {
		this.getHowl(audio).stop();
		return this;
	}

	private getHowl(audio: MusicAsset | SoundEffectAsset): Howl {
		return (audio as { readonly name: string; readonly howl: Howl }).howl;
	}
}
