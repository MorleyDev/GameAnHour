export type Colour = { readonly r: number; readonly g: number; readonly b: number; readonly a: number; }
export const Colour = (r: number, g: number, b: number, a: number = 1) => ({ r, g, b, a })

