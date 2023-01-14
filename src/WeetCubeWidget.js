/* eslint-disable require-jsdoc, new-cap, max-len */
import { Component } from "parsegraph-window";
import AlphaCamera from "./Cam";
import { AlphaInput } from "./Input";
import { quaternionFromAxisAndAngle } from "./Maths";
import Physical, { PHYSICAL_ROTATE_TRANSLATE_SCALE } from "./Physical";
import { elapsed } from "parsegraph-timing";
import { alphaWeetPainter } from "./WeetPainter";

const audioTransition = 1.2;
export default class alphaWeetCubeWidget extends Component {
  constructor(belt, window) {
    super();
    this.belt = belt;
    this.window = window;
    if (!this.window) {
      throw new Error("A Window must be provided when creating a Widget");
    }

    this.camera = new AlphaCamera();
    this.camera.setFovX(60);
    this.camera.setFarDistance(1000);
    this.camera.setNearDistance(0.1);

    this._input = new AlphaInput(this.window, this.camera);
    this._input.setMouseSensitivity(0.4);
    this._lastPaint = new Date();

    // this._input.SetOnKeyDown(this.onKeyDown, this);

    this.cubePainter = null;
    this.rotq = 0;
    this._elapsed = 0;
    this._frozen = false;
    const amt = 7;
    this._xMax = amt;
    this._yMax = amt;
    this._zMax = amt;

    this._audioOut = null;

    const baseFreq = 293.665; // 391.995;//311.127;//440;
    this._freqs = [
      baseFreq * 1.33,
      baseFreq,
      baseFreq * 0.67,
      baseFreq * 0.67 * 0.67,
      baseFreq * 0.67 * 0.67 * 0.67,
    ];

    const randomFrequencyNodeCreator = function (nodeType, minFreq, freqRange) {
      return function (audio) {
        const osc = audio.createOscillator();
        // osc.type=nodeType;
        const tRand = Math.random();
        if (tRand < 0.1) {
          osc.type = "triangle";
        } else if (tRand < 0.6) {
          osc.type = "sawtooth";
        } else if (tRand < 0.8) {
          osc.type = "sine";
        } else {
          osc.type = "square";
        }
        osc.frequency.value = minFreq + Math.random() * freqRange;
        osc.start();
        const g = audio.createGain();
        g.gain.setValueAtTime(0, audio.currentTime);
        g.gain.linearRampToValueAtTime(
          0.8,
          audio.currentTime + audioTransition
        );
        osc.connect(g);
        return g;
      };
    };

    const that = this;
    const fixedFrequencyNodeCreator = function (nodeType, freqs) {
      return function (audio) {
        const osc = audio.createOscillator();
        osc.type = nodeType;
        osc.frequency.value = freqs[that._nodesPainted % freqs.length];
        osc.start();
        const g = audio.createGain();
        g.gain.setValueAtTime(0, audio.currentTime);
        g.gain.linearRampToValueAtTime(
          0.8,
          audio.currentTime + audioTransition
        );
        osc.connect(g);
        return g;
      };
    };

    this._audioModes = [
      randomFrequencyNodeCreator("sawtooth", 24, 64),
      fixedFrequencyNodeCreator("sine", this._freqs),
      randomFrequencyNodeCreator("square", 16, 128),
      randomFrequencyNodeCreator("triangle", 64, 1024),
      fixedFrequencyNodeCreator("sawtooth", this._freqs),
      fixedFrequencyNodeCreator("triangle", this._freqs),
      randomFrequencyNodeCreator("sine", 320, 640),
      randomFrequencyNodeCreator("sawtooth", 64, 96),
    ];

    this._currentAudioMode = 2;
    /* this._audioModes = [function(audio) {
          var osc=audio.createOscillator();
          osc.type='sawtooth';
          //osc.type = "square";
          //osc.type = "sine";
          if(osc.type === "sine" || osc.type === "triangle") {
              //osc.frequency.value=freqs[z%freqs.length];
              osc.frequency.value=Math.max(320, 320+Math.random()*980);//freqs[z%freqs.length];
          }
          else if (osc.type === "square") {
              osc.frequency.value=this._freqs[this._nodesPainted%this._freqs.length];
              //osc.frequency.value=Math.max(4, Math.random()*200);//freqs[z%freqs.length];
          }
          else if(osc.type === "sawtooth") {
              osc.frequency.value=Math.max(320, 320+Math.random()*200);//freqs[z%freqs.length];
          }else {
              osc.frequency.value=Math.min(1000, Math.random()*4000);//freqs[z%freqs.length];
              //osc.frequency.value=freqs[z%freqs.length];
          }
          //osc.type = "square";
          //osc.frequency.value=Math.max(8, Math.random()*100);
          osc.start();
          //console.log(c.position);

          var randZ = Math.random() * 30;
          var randY = Math.random() * 5;
          //console.log(i, j, k, randY, randZ);
          var g = audio.createGain();
          //g.gain.setValueAtTime(0.1, audio.currentTime);
          g.gain.setValueAtTime(0, audio.currentTime);
          g.gain.linearRampToValueAtTime(audio.currentTime + 0.8, .1);
          //g.gain.exponentialRampToValueAtTime(.01, audio.currentTime + randY);
          //g.gain.linearRampToValueAtTime(0, audio.currentTime + randY + randZ);
          osc.connect(g);
          return g;
      }
      //this.createSquareAudioNode,
      //this.createSineAudioNode,
      //this.createTriangleAudioNode,
      //this.createSawtoothAudioNode
  ];
      this._audioModes = [this.createSineAudioNode, this.createSawtoothAudioNode];
      */

    this.camera.getParent().setPosition(-1, -1, this._zMax * -5.0);
    this.camera
      .getParent()
      .setOrientation(quaternionFromAxisAndAngle(0, 1, 0, Math.PI));
  }

  hasEventHandler() {
    return true;
  }

  handleEvent(eventType, eventData) {
    if (eventType === "tick") {
      this.tick();
      return true;
    } else if (eventType === "wheel") {
      return this._input.onWheel(eventData);
    } else if (eventType === "mousemove") {
      return this._input.onMousemove(eventData);
    } else if (eventType === "mousedown") {
      console.log("Starting audio");
      this.window.startAudio();
      return this._input.onMousedown(eventData);
    } else if (eventType === "mouseup") {
      return this._input.onMouseup(eventData);
    } else if (eventType === "keydown") {
      console.log("KEYDOWN");
      if (this.onKeyDown(eventData.key)) {
        return true;
      }
      return this._input.onKeydown(eventData);
    } else if (eventType === "keyup") {
      return this._input.onKeyup(eventData);
    }
    return false;
  }

  component() {
    return this._component;
  }

  createAudioNode(audio) {
    const creator = this._audioModes[this._currentAudioMode];
    const n = creator.call(this, audio);
    // console.log("Creating audio node: ", this._currentAudioMode, n);
    return n;
  }

  onKeyDown(key) {
    // console.log(key);
    switch (key) {
      case "X":
      case "x":
        this._frozen = !this._frozen;
        return true;
      case "Enter":
      case "Return":
        this.switchAudioMode();
        return true;
      default:
        // Key unhandled.
        return false;
    }
  }

  switchAudioMode() {
    this._currentAudioMode =
      (this._currentAudioMode + 1) % this._audioModes.length;
    this._modeSwitched = true;
  }

  tickIfNecessary() {
    // console.log("Necessary?", elapsed(this._lastPaint));
    if (elapsed(this._lastPaint) > 20) {
      console.log("Necessary:" + elapsed(this._lastPaint));
      this.Tick();
      return true;
    }
    return false;
  }

  tick() {
    const e = elapsed(this._lastPaint) / 500;
    this._input.update(e);
    if (!this._frozen) {
      this._elapsed += e;
    }
  }

  refresh() {
    if (this.cubePainter) {
      this.cubePainter.Init(this._xMax * this._yMax * this._zMax);
    }
  }

  setMax(max) {
    this._xMax = max;
    this._yMax = max;
    this._zMax = max;
    this.refresh();
  }

  setXMax(xMax) {
    this._xMax = xMax;
    this.refresh();
  }

  setYMax(yMax) {
    this._yMax = yMax;
    this.refresh();
  }

  setZMax(zMax) {
    this._zMax = zMax;
    this.refresh();
  }

  setRotq(rotq) {
    this.rotq = rotq;
  }

  paint() {
    const audio = this.window.audio();
    if (!this.cubePainter) {
      this.cubePainter = new alphaWeetPainter(this.window);
      this.cubePainter.Init(this._xMax * this._yMax * this._zMax);
    } else {
      this.cubePainter.Clear();
    }

    if (audio && !this._audioOut) {
      // console.log("Creating audio out");
      this._audioOut = audio.createGain();
      const compressor = audio.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audio.currentTime);
      compressor.knee.setValueAtTime(10, audio.currentTime);
      compressor.ratio.setValueAtTime(20, audio.currentTime);
      // compressor.reduction.setValueAtTime(-20, audio.currentTime);
      compressor.attack.setValueAtTime(0, audio.currentTime);
      compressor.release.setValueAtTime(0.25, audio.currentTime);
      compressor.connect(audio.destination);
      this._audioCompressorOut = compressor;
      this._audioOut.connect(compressor);
      this._modeAudioNodes = [];
      this._audioNodes = [];
      this._audioNodePositions = [];
    } else if (this._modeSwitched) {
      const oldModeNodes = [].concat(this._modeAudioNodes);
      setTimeout(function () {
        oldModeNodes.forEach(function (node) {
          node.disconnect();
        });
      }, 1000 * (audioTransition + 0.1));
    }
    const createAudioNodes = audio && this._audioNodes.length == 0;

    const c = new Physical(this.camera);
    let az = 0;

    this._nodesPainted = 0;
    let panner;

    const cubeSize = 1;
    // console.log("Painting", elapsed);
    for (let i = 0; i < this._xMax; ++i) {
      for (let j = 0; j < this._yMax; ++j) {
        for (let k = 0; k < this._zMax; ++k) {
          c.modelMode = PHYSICAL_ROTATE_TRANSLATE_SCALE;
          c.SetScale(1, 1, 1);
          c.orientation.set(0, 0, 0, 1);
          c.position.set(0, 0, 0);
          c.scale.set(1, 1, 1);
          c.rotate((this.rotq * 2 * k) / 10, 0, 1, 1);
          c.rotate((this.rotq * 2 * i) / 15, 1, 0, 0);
          c.rotate((this.rotq * 2 * j) / 10, 1, 0, 1);
          c.setPosition(3 * i, 3 * j, 3 * k);
          c.SetScale(cubeSize, cubeSize, cubeSize);
          this.cubePainter.Cube(c.getModelMatrix());
          const makeAudio = Math.random() < 0.05;
          if (createAudioNodes && makeAudio) {
            const node = this.createAudioNode(audio);
            panner = audio.createPanner();
            panner.panningModel = "HRTF";
            panner.distanceModel = "exponential";
            panner.rolloffFactor = 2;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;
            panner.connect(this._audioOut);
            node.connect(panner);
            this._modeAudioNodes.push(node);
            this._audioNodes.push(panner);
            this._audioNodePositions.push(this._nodesPainted);
          } else if (
            audio &&
            this._nodesPainted === this._audioNodePositions[az]
          ) {
            panner = this._audioNodes[az];
            if (this._modeSwitched) {
              this._modeAudioNodes[az].gain.linearRampToValueAtTime(
                0,
                audio.currentTime + audioTransition
              );
              const node = this.createAudioNode(audio);
              this._modeAudioNodes[az] = node;
              node.connect(panner);
            }
            az++;
          } else {
            panner = null;
          }

          if (panner) {
            const wv = c.getModelMatrix();
            let cx;
            let cy;
            let cz;
            cx = c.position[0] + cubeSize / 2;
            cy = c.position[1] + cubeSize / 2;
            cz = c.position[2] + cubeSize / 2;
            cx = wv[12];
            cy = wv[13];
            cz = wv[14];
            // console.log(cx, cy, cz);
            if (panner.positionX) {
              panner.positionX.value = cx;
              panner.positionY.value = cy;
              panner.positionZ.value = cz;
            } else {
              panner.setPosition(cx, cy, cz);
            }
          }
          ++this._nodesPainted;
        }
      }
    }
    this.rotq = this._elapsed;
    // console.log("dataX=" + this.cubePainter._dataX);

    this._modeSwitched = false;
    this._lastPaint = new Date();
    if (this._listener) {
      this._listener.call(this._listenerThisArg);
    }

    return true;
  }

  setUpdateListener(listener, listenerThisArg) {
    this._listener = listener;
    this._listenerThisArg = listenerThisArg || this;
  }

  render(width, height) {
    if (!this.cubePainter) {
      return false;
    }
    const gl = this.window.gl();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const cm = this.camera.getParent().getModelMatrix();
    const xPos = cm[12];
    const yPos = cm[13];
    const zPos = cm[14];
    const audio = this.window.audio();
    if (audio) {
      const listener = audio.listener;
      if (listener.positionX) {
        listener.positionX.value = xPos;
        listener.positionY.value = yPos;
        listener.positionZ.value = zPos;
      } else {
        listener.setPosition(xPos, yPos, zPos);
      }
      if (listener.forwardX) {
        const forV = cm.Transform(0, 0, 1);
        const upV = cm.Transform(0, 1, 0);
        // console.log("UP", upV[0], upV[1], upV[2]);
        listener.forwardX.setValueAtTime(forV[0], audio.currentTime);
        listener.forwardY.setValueAtTime(forV[1], audio.currentTime);
        listener.forwardZ.setValueAtTime(forV[2], audio.currentTime);
        listener.upX.setValueAtTime(upV[0], audio.currentTime);
        listener.upY.setValueAtTime(upV[1], audio.currentTime);
        listener.upZ.setValueAtTime(upV[2], audio.currentTime);
        // console.log("Setting orientation:" + forV[0] + ", " + forV[1] + ", " + forV[2]);
      }
    }
    // console.log(xPos + ", " + yPos + ", " + zPos);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    const projection = this.camera.updateProjection(width, height);
    // console.log("projection is" + projection.toString());
    const viewMatrix = this.camera.getViewMatrix().multiplied(projection);
    // console.log("CameraViewMatrix is" + this.camera.GetViewMatrix().toString());
    // console.log("viewMatrix is " + viewMatrix.toString());
    this.cubePainter.Draw(viewMatrix);
    return true;
  }
}
