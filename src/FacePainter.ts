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
  faceProgram: WebGLProgram;
  faceBuffer: PagingBuffer;

  aPosition: number;
  aColor: number;
  uWorld: WebGLUniformLocation;

  gl() {
    return this._glProvider.gl();
  }

  constructor(glProvider: GLProvider) {
    this._glProvider = glProvider;
  }

  clear() {
    this.faceBuffer.clear();
    this.faceBuffer.addPage();
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
    c2: Color,
    c3: Color
  ) {
    if (!c2) {
      c2 = c1;
    }
    if (!c3) {
      c3 = c1;
    }

    this.faceBuffer.appendData(
      this.aPosition,
      v1[0],
      v1[1],
      v1[2],
      v2[0],
      v2[1],
      v2[2],
      v3[0],
      v3[1],
      v3[2]
    );
    this.faceBuffer.appendData(
      this.aColor,
      ...c1.values(),
      1.0,
      ...c2.values(),
      1.0,
      ...c3.values(),
      1.0
    );
  }

  draw(viewMatrix: AlphaRMatrix4) {
    if (!viewMatrix) {
      throw new Error("A viewMatrix must be provided");
    }

    const gl = this.gl();
    if (!this.faceProgram) {
      this.faceProgram = compileProgram(
        this._glProvider,
        "alpha-FacePainter",
        alphaFacePainterVertexShader,
        alphaFacePainterFragmentShader
      );

      // Prepare attribute buffers.
      this.faceBuffer = new PagingBuffer(gl, this.faceProgram);
      this.aPosition = this.faceBuffer.defineAttrib("a_position", 3);
      this.aColor = this.faceBuffer.defineAttrib("a_color", 4);

      // Cache program locations.
      this.uWorld = gl.getUniformLocation(this.faceProgram, "u_world");

      this.faceBuffer.addPage();
    }

    // Render faces.
    gl.useProgram(this.faceProgram);
    gl.uniformMatrix4fv(this.uWorld, false, viewMatrix.toArray());
    this.faceBuffer.renderPages();
  }
}
