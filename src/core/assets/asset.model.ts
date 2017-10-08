import { Howl } from "howler";

export type BlittableAsset = ImageAsset | VideoAsset;

export type ImageAsset = HTMLImageElement | ImageBitmap;
export type VideoAsset = HTMLVideoElement;

export type AudioAsset = Howl;
