/* eslint-disable require-jsdoc */

import alphaWeetPainterVertexShader from './WeetPainter_VertexShader.glsl';
import alphaWeetPainterFragmentShader from './WeetPainter_FragmentShader.glsl';
import { AlphaColor } from './BlockStuff';
import {setIgnoreGLErrors} from 'parsegraph-checkglerror';
setIgnoreGLErrors(false);

import checkGLError, {ignoreGLErrors} from 'parsegraph-checkglerror';

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @param {string} shaderName The name used for debugging
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl, shaderSource, shaderType, shaderName) {
  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  console.log("Checking Shaders" + ignoreGLErrors());
  // Check if it compiled
  if (!ignoreGLErrors()) {
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      throw new Error(
          'Could not compile ' +
          (shaderType === gl.FRAGMENT_SHADER ? 'fragment' : 'vertex') +
          ' shader ' +
          shaderName +
          ': ' +
          gl.getShaderInfoLog(shader),
      );
    }
  }

  return shader;
}

function compileProgram(
    window,
    shaderName,
    vertexShader,
    fragShader
) {
  const gl = window.gl();
  const shaders = window.shaders();
  if (gl.isContextLost()) {
    return;
  }
  if (shaders[shaderName]) {
    return shaders[shaderName];
  }

  const program = gl.createProgram();
  checkGLError(
      gl,
      'compileProgram.createProgram(shaderName=\'',
      shaderName,
      ')',
  );

  const compiledVertexShader = compileShader(
      gl,
      vertexShader,
      gl.VERTEX_SHADER,
      shaderName,
  );
  checkGLError(
      gl,
      'compileProgram.compile vertex shader(shaderName=\'',
      shaderName,
      ')',
  );

  gl.attachShader(program, compiledVertexShader);
  checkGLError(
      gl,
      'compileProgram.attach vertex shader(shaderName=\'',
      shaderName,
      ')',
  );

  const compiledFragmentShader = compileShader(
      gl,
      fragShader,
      gl.FRAGMENT_SHADER,
      shaderName,
  );
  checkGLError(
      gl,
      'compileProgram.compile fragment shader(shaderName=\'',
      shaderName,
      ')',
  );
  gl.attachShader(program, compiledFragmentShader);
  checkGLError(
      gl,
      'compileProgram.attach fragment shader(shaderName=\'',
      shaderName,
      ')',
  );

  gl.linkProgram(program);
  if (!ignoreGLErrors()) {
    const st = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!st) {
      throw new Error(
          '\'' +
          shaderName +
          '\' shader program failed to link:\n' +
          gl.getProgramInfoLog(program),
      );
    }
    const err = gl.getError();
    if (err != gl.NO_ERROR && err != gl.CONTEXT_LOST_WEBGL) {
      throw new Error(
          '\'' + shaderName + '\' shader program failed to link: ' + err,
      );
    }
  }

  shaders[shaderName] = program;
  // console.log("Created shader for " + shaderName + ": " + program);
  return program;
}
/*
 * Draws 3d faces in a solid color.
 */
export function alphaWeetPainter(window) {
  if (!window) {
    throw new Error('A Window must be provided when creating a WeetPainter');
  }
  this.gl = window.gl();
  this._numCubes = null;

  setIgnoreGLErrors(false);
  this.faceProgram = compileProgram(
      window,
      'alpha_WeetPainter',
      alphaWeetPainterVertexShader,
      alphaWeetPainterFragmentShader,
  );
  console.log(this.faceProgram);

  // Prepare attribute buffers.
  this.a_position = this.gl.getAttribLocation(this.faceProgram, 'a_position');
  this.a_color = this.gl.getAttribLocation(this.faceProgram, 'a_color');

  // Cache program locations.
  this.u_world = this.gl.getUniformLocation(this.faceProgram, 'u_world');
}

const cubeSize = 1;
const width = cubeSize;
const length = cubeSize;
const height = cubeSize;
const cv = [
  // Front
  [-width, length, height], // v0
  [width, length, height], // v1
  [width, length, -height], // v2
  [-width, length, -height], // v3

  // Back
  [width, -length, height], // v4
  [-width, -length, height], // v5
  [-width, -length, -height], // v6
  [width, -length, -height], // v7

  // Left
  [width, length, height], // v1
  [width, -length, height], // v4
  [width, -length, -height], // v7
  [width, length, -height], // v2

  // Right
  [-width, -length, height], // v5
  [-width, length, height], // v0
  [-width, length, -height], // v3
  [-width, -length, -height], // v6

  // Top
  [width, length, height], // v1
  [-width, length, height], // v0
  [-width, -length, height], // v5
  [width, -length, height], // v4

  // Bottom
  [width, -length, -height], // v7
  [-width, -length, -height], // v6
  [-width, length, -height], // v3
  [width, length, -height], // v2
];
const CUBE_VERTICES = cv;

const CUBE_COLORS = [
  new AlphaColor(1, 1, 0), // 0
  new AlphaColor(0, 1, 1), // 5
  new AlphaColor(1, 0, 1), // 1
  new AlphaColor(0, 0, 1), // 2
  new AlphaColor(1, 0, 0), // 3
  new AlphaColor(0, 1, 0), // 4
];

alphaWeetPainter.prototype.Init = function(numCubes) {
  if (!this._posBuffer) {
    this._posBuffer = this.gl.createBuffer();
  }
  this._data = new Float32Array(numCubes * 6 * 6 * 4);
  // console.log("Data is " + this._data.length + " floats large");
  this._dataX = 0;

  if (!this._colorBuffer) {
    this._colorBuffer = this.gl.createBuffer();
  }
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._colorBuffer);
  const colorData = this._data;
  let x = 0;
  for (let i = 0; i < numCubes; ++i) {
    // Cube
    for (let j = 0; j < 6; ++j) {
      // Face
      const col = CUBE_COLORS[j];
      for (let k = 0; k < 6; ++k) {
        // Vertex
        colorData[x++] = col[0];
        colorData[x++] = col[1];
        colorData[x++] = col[2];
        colorData[x++] = 1.0;
      }
    }
  }
  // console.log("color floats rendered = " + 4*x);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, colorData, this.gl.STATIC_DRAW);
  this._numCubes = numCubes;
};

alphaWeetPainter.prototype.Cube = function(m) {
  if (!this._data) {
    throw new Error('Init must be called first');
  }
  const drawFace = function(c1, c2, c3, c4, color) {
    const drawVert = function(v) {
      const x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[12];
      const y = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[13];
      const z = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[14];
      this._data[this._dataX++] = x;
      this._data[this._dataX++] = y;
      this._data[this._dataX++] = z;
      this._data[this._dataX++] = 1.0;
      // console.log("(" + x + ", " + y + ", " + z+ ")");
    };

    drawVert.call(this, c1);
    drawVert.call(this, c2);
    drawVert.call(this, c3);
    drawVert.call(this, c1);
    drawVert.call(this, c3);
    drawVert.call(this, c4);
  };

  const cv = CUBE_VERTICES;
  const cc = CUBE_COLORS;
  // Front, COLOR
  drawFace.call(this, cv[0], cv[1], cv[2], cv[3], cc[0]);
  // Back
  drawFace.call(this, cv[4], cv[5], cv[6], cv[7], cc[5]);
  // Left
  drawFace.call(this, cv[8], cv[9], cv[10], cv[11], cc[1]);
  // Right
  drawFace.call(this, cv[12], cv[13], cv[14], cv[15], cc[2]);
  // Top
  drawFace.call(this, cv[16], cv[17], cv[18], cv[19], cc[3]);
  // Bottom
  drawFace.call(this, cv[20], cv[21], cv[22], cv[23], cc[4]);
};

alphaWeetPainter.prototype.Clear = function() {
  if (!this._data) {
    return;
  }
  this._dataX = 0;
};

alphaWeetPainter.prototype.Draw = function(viewMatrix) {
  if (!viewMatrix) {
    throw new Error('A viewMatrix must be provided');
  }

  // Render faces.
  const gl = this.gl;
  // gl.disable(gl.CULL_FACE);
  gl.useProgram(this.faceProgram);
  gl.uniformMatrix4fv(this.u_world, false, viewMatrix.toArray());

  gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuffer);
  // console.log("dataX * sizeof(float = " + 4*this._dataX);
  gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.STREAM_DRAW);
  gl.vertexAttribPointer(this.a_position, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.a_position);

  gl.enableVertexAttribArray(this.a_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
  gl.vertexAttribPointer(this.a_color, 4, gl.FLOAT, false, 0, 0);

  // console.log("num rendered = " + (this._dataX / 4));
  gl.drawArrays(gl.TRIANGLES, 0, this._dataX / 4);

  gl.disableVertexAttribArray(this.a_position);
  gl.disableVertexAttribArray(this.a_color);
};
