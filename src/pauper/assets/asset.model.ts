import { Howl } from "howler";

export type BlittableAsset = ImageAsset | VideoAsset;

export type ImageAsset = HTMLImageElement | ImageBitmap | { readonly width: number; readonly height: number; readonly name: string; readonly src: string  };
export type VideoAsset = HTMLVideoElement;

export type SoundEffectAsset = Howl | { readonly name: string; readonly src: string };
