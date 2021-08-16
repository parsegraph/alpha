import { compileShader } from "parsegraph-shader";
import { createPagingBuffer } from "parsegraph-pagingbuffer";

const alphaFacePainterVertexShader =
  'uniform mat4 u_world;\n' +
  '\n' +
  'attribute vec3 a_position;\n' +
  'attribute vec4 a_color;\n' +
  '\n' +
  'varying highp vec4 contentColor;\n' +
  '\n' +
  'void main() {\n' +
  'gl_Position = u_world * vec4(a_position, 1.0);' +
  'contentColor = a_color;' +
  '}';

const alphaFacePainterFragmentShader =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  '' +
  'varying highp vec4 contentColor;\n' +
  '\n' +
  'void main() {\n' +
  'gl_FragColor = contentColor;' +
  '}';

/**
 * Draws 3d faces in a solid color.
 */
export default class FacePainter {
  constructor(gl) {
    this.gl = gl;
    if (!this.gl || !this.gl.createProgram) {
      throw new Error('FacePainter must be given a GL interface');
    }

    this.faceProgram = this.gl.createProgram();

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alphaFacePainterVertexShader,
            this.gl.VERTEX_SHADER,
        ),
    );

    this.gl.attachShader(
        this.faceProgram,
        compileShader(
            this.gl,
            alphaFacePainterFragmentShader,
            this.gl.FRAGMENT_SHADER,
        ),
    );

    this.gl.linkProgram(this.faceProgram);
    if (!this.gl.getProgramParameter(this.faceProgram, this.gl.LINK_STATUS)) {
      throw new Error('FacePainter program failed to link.');
    }

    // Prepare attribute buffers.
    this.faceBuffer = createPagingBuffer(this.gl, this.faceProgram);
    this.a_position = this.faceBuffer.defineAttrib('a_position', 3);
    this.a_color = this.faceBuffer.defineAttrib('a_color', 4);

    // Cache program locations.
    this.u_world = this.gl.getUniformLocation(this.faceProgram, 'u_world');

    this.faceBuffer.addPage();
  }

  clear() {
    this.faceBuffer.clear();
    this.faceBuffer.addPage();
  };

  quad(v1, v2, v3, v4, c1, c2, c3, c4) {
    this.triangle(v1, v2, v3, c1, c2, c3);
    this.triangle(v1, v3, v4, c1, c3, c4);
  };

  /*
   * painter.triangle(v1, v2, v3, c1, c2, c3);
   */

  triangle(v1, v2, v3, c1, c2, c3) {
    if (!c2) {
      c2 = c1;
    }
    if (!c3) {
      c3 = c1;
    }

    this.faceBuffer.appendData(
        this.a_position,
        v1[0],
        v1[1],
        v1[2],
        v2[0],
        v2[1],
        v2[2],
        v3[0],
        v3[1],
        v3[2],
    );
    if (c1.length == 3) {
      this.faceBuffer.appendData(
          this.a_color,
          c1[0],
          c1[1],
          c1[2],
          1.0,
          c2[0],
          c2[1],
          c2[2],
          1.0,
          c3[0],
          c3[1],
          c3[2],
          1.0,
      );
    } else {
      this.faceBuffer.appendData(
          this.a_color,
          c1[0],
          c1[1],
          c1[2],
          c1[3],
          c2[0],
          c2[1],
          c2[2],
          c2[3],
          c3[0],
          c3[1],
          c3[2],
          c3[3],
      );
    }
  };

  draw(viewMatrix) {
    if (!viewMatrix) {
      throw new Error('A viewMatrix must be provided');
    }
    // Render faces.
    this.gl.useProgram(this.faceProgram);
    this.gl.uniformMatrix4fv(this.u_world, false, viewMatrix.toArray());
    this.faceBuffer.renderPages();
  };
}

/*
const TestSuite = require('parsegraph-testsuite').default;

alpha_FacePainter_Tests = new TestSuite('alpha_FacePainter');

alpha_FacePainter_Tests.addTest('alpha_FacePainter', function(resultDom) {
  const belt = new parsegraph_TimingBelt();
  const window = new parsegraph_Window();
  const widget = new alpha_GLWidget(belt, window);
  const painter = new alpha_FacePainter(window.gl());
});
*/