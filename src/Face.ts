import { AlphaVector } from "parsegraph-physical";

export const enum DrawType {
  TRIANGLES,
  QUADS,
}

// --------------------------------------------
// --------------------------------------------
// ---------------  Face  ---------------------
// --------------------------------------------
// --------------------------------------------
// face is a simple grouping of vertices
// designed to be rendered by 1 call of GL_QUADS
// or its ilk
// local cubeTop = new AlphaFace(alphaQUADS, vector, vector, vector, vector);
//
// Face does not copy the vectors.
// because its a temporary construction
// Once it is passed to a shape the shape will copy it
// DO NOT REUSE ( until after the face is applied to a shape )
export default class Face {
  _drawType: DrawType;
  _positions: AlphaVector[];

  constructor(drawType: DrawType, ...positions: AlphaVector[]) {
    this._drawType = drawType;
    this._positions = positions;
  }

  get(i: number) {
    return this.positions()[i];
  }

  drawType() {
    return this._drawType;
  }

  clone() {
    return new Face(this.drawType(), ...this._positions);
  }

  length() {
    return this.positions().length;
  }

  positions() {
    return this._positions;
  }

  toString() {
    return `Face[${this.positions()
      .map((pos) => pos.toString())
      .join(", ")}]`;
  }
}
