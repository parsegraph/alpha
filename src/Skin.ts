import Color from "./Color";

// --------------------------------------------
// --------------------------------------------
// ---------------  Skin  ---------------------
// --------------------------------------------
// --------------------------------------------
// the skin object is simply an ordered list of colors
// one for each vertex of each face of a shape.
// a skin can only be applied to a shape with
// the same number of vertices
// you create a skin by passing it a nested table of colors
// skins aren't designed to be edited once created
// Skin( {
// 	{ green, green, green, green }, -- skin 1 has 4 vertices
// 	{ brown, brown, brown, brown }, -- skin 2
// 	{ brown, brown, brown, brown }, -- skin 3
// 		--and so on until you have the full skin
// })
export default class Skin {
  _colors: Color[][];

  constructor(...colors: Color[][]) {
    this._colors = colors;
  }

  get(i: number) {
    return this._colors[i];
  }

  colors() {
    return this._colors;
  }

  length() {
    return this.colors().length;
  }

  forEach(cb: (c: Color[], i: number) => void) {
    this.colors().forEach(cb);
  }
}
