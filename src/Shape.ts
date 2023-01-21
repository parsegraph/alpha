import Face from './Face';

// --------------------------------------------
// --------------------------------------------
// --------------  Shape  ---------------------
// --------------------------------------------
// --------------------------------------------
// shape is a list of faces
// tha when all drawn will make some sort of ...
// SHAPE -- SURPISE!
// initialize it with a list of faces;
// let CUBE = new alpha_Shape(
// cubeTop,
// cubeBottom,
// cubeLeft,
// cubeRight,
// cubeFront,
// cubeBack
// )
export default class Shape {
  _faces: Face[];

  constructor(...faces: Face[]) {
    this._faces = faces.map(face=>face.clone());
  }

  get(i: number) {
    return this._faces[i];
  }

  faces() {
    return this._faces;
  }

  length() {
    return this.faces().length;
  }
}

