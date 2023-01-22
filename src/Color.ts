// --------------------------------------------
// --------------------------------------------
// ---------------  Colors  -------------------
// --------------------------------------------
// --------------------------------------------
// a simple class to make it easier to create colors;
// usage:
// local brown = Color( {.5,.25,1} ) or Color( .5,.25,1)
// local tan = Color( 203, 133, 63);
// local darkbrown = Color( "#3b2921")

export default class Color {
  _values: [number, number, number];

  constructor(r: number, g: number, b: number) {
    this._values = [r, g, b];
  }

  values() {
    return this._values;
  }

  asRGB() {
    return `rgb(${this.values()
      .map((val) => Math.round(val * 255))
      .join(", ")})`;
  }

  static fromHex(hex: string) {
    // passed a hex color (hopefully)
    let start = 0;
    if (hex.charAt(0) === "#") {
      // strip the # from it
      start = 1;
    }
    const r = Number.parseInt(hex.substring(start, start + 2), 16);
    const g = Number.parseInt(hex.substring(start + 2, start + 4), 16);
    const b = Number.parseInt(hex.substring(start + 4, start + 6), 16);
    return new Color(r / 255, g / 255, b / 255);
  }

  set(r: number, g: number, b: number) {
    this._values[0] = r;
    this._values[1] = g;
    this._values[2] = b;
  }

  length() {
    return this.values().length;
  }

  equals(...args: any[]) {
    if (args.length > 1) {
      // Direct color values
      for (let i = 0; i < this.length(); ++i) {
        if (this._values[i] != args[i]) {
          return false;
        }
      }
    } else if (typeof args[0] === "number") {
      // Compare to a single color value.
      for (let i = 0; i < this.length(); ++i) {
        if (this._values[i] != args[0]) {
          return false;
        }
      }
    } else if (args[0] instanceof Color) {
      // Other color
      for (let i = 0; i < this.length(); ++i) {
        if (this._values[i] != args[0]._values[i]) {
          return false;
        }
      }
    } else {
      // Generic array
      for (let i = 0; i < this.length(); ++i) {
        if (this._values[i] != args[0][i]) {
          return false;
        }
      }
    }
    return true;
  }

  toString() {
    return this.asRGB();
  }
}
