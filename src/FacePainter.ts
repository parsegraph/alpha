import Color from "./Color";
import { AlphaVector, AlphaRMatrix4 } from "parsegraph-physical";
import PagingBuffer from "parsegraph-pagingbuffer";

import { compileProgram, GLProvider } from "parsegraph-compileprogram";

const alphaFacePainterVertexShader =
  "uniform mat4 u_world;\n" +
  "\n" +
  "attribute vec3 a_position;\n" +
  "attribute vec4 a_color;\n" +
  "\n" +
  "varying highp vec4 contentColor;\n" +
  "\n" +
  "void main() {\n" +
  "gl_Position = u_world * vec4(a_position, 1.0);" +
  "contentColor = a_color;" +
  "}";

const alphaFacePainterFragmentShader =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "" +
  "varying highp vec4 contentColor;\n" +
  "\n" +
  "void main() {\n" +
  "gl_FragColor = contentColor;" +
  "}";

/**
 * Draws 3d faces in a solid color.
 */
export default class FacePainter {
  _glProvider: GLProvider;
  _faceProgram: WebGLProgram;

  aPosition: number;
  aColor: number;
  uWorld: WebGLUniformLocation;

  _posBuffer: WebGLBuffer;
  _colorBuffer: WebGLBuffer;

  _colorData: Float32Array;
  _colorX: number;

  _posData: Float32Array;
  _posX: number;

  gl() {
    return this._glProvider.gl();
  }

  constructor(glProvider: GLProvider) {
    this._glProvider = glProvider;
  }

  initBuffer(numVerts: number) {
    if (!this._faceProgram) {
      this._faceProgram = compileProgram(
        this._glProvider,
        "alpha-FacePainter",
        alphaFacePainterVertexShader,
        alphaFacePainterFragmentShader
      );

      // Prepare attribute buffers.
      const gl = this.gl();
      this.aPosition = gl.getAttribLocation(this._faceProgram, "a_position");
      this.aColor = gl.getAttribLocation(this._faceProgram, "a_color");

      // Cache program locations.
      this.uWorld = gl.getUniformLocation(this._faceProgram, "u_world");

      this._posBuffer = gl.createBuffer();
      this._colorBuffer = gl.createBuffer();
    }

    if (!this._posData || this._posData.length != numVerts * 3) {
      this._posData = new Float32Array(numVerts * 3);
    }
    this._posX = 0;

    if (!this._colorData || this._colorData.length != numVerts * 4) {
      this._colorData = new Float32Array(numVerts * 4);
    }
    this._colorX = 0;
  }

  quad(
    v1: AlphaVector,
    v2: AlphaVector,
    v3: AlphaVector,
    v4: AlphaVector,
    c1: Color,
    c2: Color,
    c3: Color,
    c4: Color
  ) {
    this.triangle(v1, v2, v3, c1, c2, c3);
    this.triangle(v1, v3, v4, c1, c3, c4);
  }

  /*
   * painter.triangle(v1, v2, v3, c1, c2, c3);
   */

  triangle(
    v1: AlphaVector,
    v2: AlphaVector,
    v3: AlphaVector,
    c1: Color,
    c2?: Color,
    c3?: Color
  ) {
    if (!c2) {
      c2 = c1;
    }
    if (!c3) {
      c3 = c1;
    }

    if (this._posX > this._posData.length) {
      throw new Error("FacePainter pos overflow");
    }
    if (this._colorX > this._colorData.length) {
      throw new Error("FacePainter color overflow");
    }

    this._posData[this._posX++] = v1[0];
    this._posData[this._posX++] = v1[1];
    this._posData[this._posX++] = v1[2];
    this._posData[this._posX++] = v2[0];
    this._posData[this._posX++] = v2[1];
    this._posData[this._posX++] = v2[2];
    this._posData[this._posX++] = v3[0];
    this._posData[this._posX++] = v3[1];
    this._posData[this._posX++] = v3[2];

    this._colorData[this._colorX++] = c1.values()[0];
    this._colorData[this._colorX++] = c1.values()[1];
    this._colorData[this._colorX++] = c1.values()[2];
    this._colorData[this._colorX++] = 1.0;
    this._colorData[this._colorX++] = c2.values()[0];
    this._colorData[this._colorX++] = c2.values()[1];
    this._colorData[this._colorX++] = c2.values()[2];
    this._colorData[this._colorX++] = 1.0;
    this._colorData[this._colorX++] = c3.values()[0];
    this._colorData[this._colorX++] = c3.values()[1];
    this._colorData[this._colorX++] = c3.values()[2];
    this._colorData[this._colorX++] = 1.0;
  }

  commit() {
    if (!this._faceProgram) {
      // Nothing drawn.
      return;
    }

    const gl = this.gl();

    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._posData, gl.STREAM_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._colorData, gl.STREAM_DRAW);
  }

  draw(viewMatrix: AlphaRMatrix4) {
    if (!viewMatrix) {
      throw new Error("A viewMatrix must be provided");
    }

    if (!this._faceProgram) {
      // Nothing drawn.
      return;
    }

    const gl = this.gl();

    // Render faces.
    gl.useProgram(this._faceProgram);
    gl.uniformMatrix4fv(this.uWorld, false, viewMatrix.toArray());

    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuffer);
    gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aColor);

    gl.drawArrays(gl.TRIANGLES, 0, this._posX / 3);

    gl.disableVertexAttribArray(this.aPosition);
    gl.disableVertexAttribArray(this.aColor);
  }
}
