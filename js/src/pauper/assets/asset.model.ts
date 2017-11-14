import { Howl } from "howler";

export type BlittableAsset = ImageAsset | VideoAsset;

export type ImageAsset = HTMLImageElement | ImageBitmap | { readonly width: number; readonly height: number; readonly name: string; readonly src: string  };
export type VideoAsset = HTMLVideoElement;

export type SoundEffectAsset = { readonly name: string; readonly howl: Howl } | { readonly name: string; readonly src: string };
export type MusicAsset = { readonly name: string; readonly howl: Howl } | { readonly name: string; readonly src: string };
