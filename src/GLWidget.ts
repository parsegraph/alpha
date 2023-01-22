// TODO Blocks in foreground are rendered
// improperly relative to the projection matrix.
import { elapsed } from "parsegraph-timing";

import Color from "parsegraph-color";
import Block from "./Block";
import { Projector } from "parsegraph-projector";
import { standardBlockTypes } from "./standardBlockTypes";
import BlockTypes from "./BlockTypes";
import {
  AlphaVector,
  AlphaQuaternion,
  BasicPhysical,
  AlphaCamera,
  quaternionFromAxisAndAngle,
  alphaRandom,
} from "parsegraph-physical";
import Cluster from "./Cluster";
import CubeMan from "./CubeMan";
import AlphaInput from "./Input";

import { Renderable } from "parsegraph-timingbelt";
import Method from "parsegraph-method";

// TODO Mouse input appears to be... strangely interpreted.

class TimeRange<T = any> {
  _startTime: number;
  _finishTime: number;
  _val: T;

  constructor(val?: T) {
    this._startTime = Date.now();
    this._finishTime = NaN;
    this._val = val;
  }

  value() {
    return this._val;
  }

  finish() {
    this._finishTime = Date.now();
  }

  duration() {
    return this._finishTime - this._startTime;
  }
}

class FramerateOverlay {
  _frames: TimeRange[];
  _currentPaint: TimeRange;
  _currentRender: TimeRange;

  constructor() {
    this._frames = [];
    this._currentRender = null;
    this._currentPaint = null;
  }

  invalidated() {}

  startPaint() {
    this._currentPaint = new TimeRange("paint");
    this._frames.push(this._currentPaint);
  }

  finishPaint() {
    this._currentPaint?.finish();
  }

  startRender() {
    this._currentRender = new TimeRange("render");
    this._frames.push(this._currentRender);
  }

  finishRender() {
    this._currentRender?.finish();
  }

  draw(proj: Projector) {
    while (this._frames.length > proj.width()) {
      this._frames.shift();
    }
    const lineHeight = 22;
    const width = proj.width();
    const height = proj.height();
    const ctx = proj.overlay();

    ctx.clearRect(0, height - proj.height() / 3, width, proj.height() / 3);
    ctx.font = "18px monospace";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";

    this._frames.forEach((range, i)=>{
      ctx.fillStyle = range.value() === "paint" ? "green" : "blue";
      const dur = Math.min(proj.height() / 3, range.duration());
      ctx.fillRect(i, height - dur, 1, dur);
    });

    ctx.fillStyle = "blue";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    const renderDuration = this._currentRender?.duration();
    let line = `Render: ${renderDuration}ms`;
    ctx.strokeText(line, width, height);
    ctx.fillText(line, width, height);

    ctx.fillStyle = "green";
    const paintDuration = this._currentPaint?.duration();
    line = `Paint: ${paintDuration}ms`;
    ctx.strokeText(line, width, height - lineHeight);
    ctx.fillText(line, width, height - lineHeight);

    ctx.fillStyle = "gray";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    const d = Date.now();
    ctx.strokeText(d.toString(), 0, height);
    ctx.fillText(d.toString(), 0, height);

    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    line = `${width}x${height}`;
    ctx.strokeText(line, width, 0);
    ctx.fillText(line, width, 0);
  }
}

// test version 1.0
export default class AlphaGLWidget implements Renderable {
  _backgroundColor: Color;
  camera: AlphaCamera;
  _start: number;
  paintingDirty: boolean;
  _input: AlphaInput;
  _done: boolean;
  blockTypes: BlockTypes;
  time: number;
  _onUpdate: Method;

  orbit: BasicPhysical;
  playerAPhysical: BasicPhysical;
  playerBPhysical: BasicPhysical;
  offsetPlatformPhysical: BasicPhysical;
  spherePhysical: BasicPhysical;
  swarm: BasicPhysical[];

  originCluster: Cluster;
  playerCluster: Cluster;
  worldCluster: Cluster;
  platformCluster: Cluster;
  evPlatformCluster: Cluster;
  testCluster: Cluster;
  sphereCluster: Cluster;

  _projector: Projector;

  _framerateOverlay: FramerateOverlay;

  constructor(projector: Projector) {
    this._framerateOverlay = new FramerateOverlay();
    this._projector = projector;
    this._backgroundColor = new Color(0, 47 / 255, 57 / 255);

    this.camera = new AlphaCamera();
    this._start = NaN;
    this._onUpdate = new Method();

    // Set the field of view.
    this.camera.setFovX(60);
    // this.camera.SetProperFOV(2,2);

    // Set the camera's near and far distance.
    this.camera.setFarDistance(1000);
    this.camera.setNearDistance(1);

    this.paintingDirty = true;

    // this.camera.pitchDown(40 * Math.PI / 180);

    this._input = new AlphaInput(this.camera);
    this._input.setOnScheduleUpdate(() => {
      this.scheduleRepaint();
    });
    this._input.setMouseSensitivity(0.4);
    this._input.mount(this.projector().container());

    this._done = false;

    this.blockTypes = new BlockTypes();
    standardBlockTypes(this.blockTypes);
    CubeMan(this.blockTypes);

    const cubeman = this.blockTypes.find("blank", "cubeman");

    this.testCluster = new Cluster(this.glProvider());
    this.testCluster.addBlock(new Block(cubeman, 0, 5, 0, 0));

    const stone = this.blockTypes.find("stone", "cube");
    const grass = this.blockTypes.find("grass", "cube");
    const dirt = this.blockTypes.find("dirt", "cube");

    this.originCluster = new Cluster(this.glProvider());
    // this.originCluster.addBlock(stone,0,0,-50,0);

    this.platformCluster = new Cluster(this.glProvider());
    this.worldCluster = new Cluster(this.glProvider());

    this.playerCluster = new Cluster(this.glProvider());

    for (let i = 0; i <= 2; ++i) {
      this.playerCluster.addBlock(new Block(grass, 0, i, 0, 0));
    }

    this.playerCluster.addBlock(new Block(grass, -1, 3, 0, 16)); // left

    this.playerCluster.addBlock(new Block(grass, 0, 4, 0, 12)); // head

    this.playerCluster.addBlock(new Block(grass, 1, 3, 0, 8)); // right

    const WORLD_SIZE = 30;
    const MAX_TYPE = 23;
    for (let i = -WORLD_SIZE; i <= WORLD_SIZE; ++i) {
      for (let j = 1; j <= WORLD_SIZE * 2; ++j) {
        const r = alphaRandom(0, MAX_TYPE);
        this.worldCluster.addBlock(
          new Block([grass, stone][alphaRandom(0, 1)], i, -1, -j, r)
        );
      }
    }

    // build a platform

    for (let i = -3; i <= 3; ++i) {
      for (let j = -4; j <= 4; ++j) {
        this.platformCluster.addBlock(new Block(grass, j, 0, -i, 0));
      }
    }

    this.evPlatformCluster = new Cluster(this.glProvider());
    for (let i = -2; i <= 2; ++i) {
      for (let j = 3; j <= 4; ++j) {
        this.evPlatformCluster.addBlock(new Block(dirt, j, 1, i, 0));
      }
    }

    this.orbit = new BasicPhysical(this.camera);
    this.orbit.setPosition(0, 0, 0);
    const elevator = new BasicPhysical(this.camera);
    elevator.setPosition(0, 5, 0);

    this.camera.setParent(this.camera);
    this.playerAPhysical = new BasicPhysical(this.camera);
    this.playerBPhysical = new BasicPhysical(this.camera);
    this.offsetPlatformPhysical = new BasicPhysical(this.camera);

    this.offsetPlatformPhysical.setParent(this.camera);
    this.playerAPhysical.setParent(this.offsetPlatformPhysical);
    this.playerBPhysical.setParent(this.camera);

    this.camera.setParent(this.playerBPhysical);

    this.playerAPhysical.setPosition(10, 1, 0);

    this.playerBPhysical.setPosition(0, 0, -3);

    this.offsetPlatformPhysical.setPosition(0, 0, -25);
    this.offsetPlatformPhysical.yawLeft(0);
    this.offsetPlatformPhysical.rollRight(0);

    this.spherePhysical = new BasicPhysical(this.camera);
    this.spherePhysical.setPosition(45, 0, 0);

    const radius = 8;
    this.sphereCluster = new Cluster(this.glProvider());

    // first circle about the x-axis
    let rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(1, 0, 0, (rot * Math.PI) / 180);
      rot += 15;
      const p = q.rotatedVector(0, 0, -radius);
      this.sphereCluster.addBlock(new Block(stone, p[0], p[1], p[2], 0));
    }

    rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(0, 1, 0, (rot * Math.PI) / 180);
      rot += 15;

      const p = q.rotatedVector(0, 0, -radius);
      this.sphereCluster.addBlock(new Block(stone, p[0], p[1], p[2], 0));
    }

    const spot = new AlphaVector(0, 15, 35);
    this.swarm = [];
    for (let i = 0; i < 10; ++i) {
      this.swarm.push(new BasicPhysical(this.camera));
      let x = alphaRandom(1, 30);
      let y = alphaRandom(1, 30);
      let z = alphaRandom(1, 30);
      this.swarm[i].setPosition(spot.added(x, y, z));

      x = alphaRandom(-100, 100) / 100;
      y = alphaRandom(-100, 100) / 100;
      z = alphaRandom(-100, 100) / 100;
      const w = alphaRandom(-100, 100) / 100;
      const q = new AlphaQuaternion(x, y, z, w);
      q.normalize();
      this.swarm[i].setOrientation(q);
    }

    this.time = 0;
  } // AlphaGLWidget

  glProvider() {
    return this.projector().glProvider();
  }

  paint() {
    if (!this.paintingDirty) {
      return false;
    }
    this._framerateOverlay.startPaint();
    const blockTypes = this.blockTypes;
    this.evPlatformCluster.calculateVertices(blockTypes);
    this.testCluster.calculateVertices(blockTypes);
    this.originCluster.calculateVertices(blockTypes);
    this.playerCluster.calculateVertices(blockTypes);
    this.worldCluster.calculateVertices(blockTypes);
    this.platformCluster.calculateVertices(blockTypes);
    this.sphereCluster.calculateVertices(blockTypes);
    this.paintingDirty = false;
    this._framerateOverlay.finishPaint();
    return true;
  }

  hasEventHandler() {
    return true;
  }

  weetcubeHandleEvent(eventType: string, eventData?: any) {
    const callListener = () => {
      // this is from weetcubes
      if (eventType === "wheel") {
        return this._input.onWheel(eventData);
      } else if (eventType === "mousemove") {
        return this._input.onMousemove(eventData);
      } else if (eventType === "mousedown") {
        return this._input.onMousedown(eventData);
      } else if (eventType === "mouseup") {
        return this._input.onMouseup(eventData);
      } else if (eventType === "keydown") {
        return this._input.onKeydown(eventData);
      } else if (eventType === "keyup") {
        return this._input.onKeyup(eventData);
      }
    };
    const rv = callListener();
    this.scheduleRepaint();
    // this is from weetcubes
    return rv;
  }

  tick(time: number) {
    if (isNaN(this._start)) {
      this._start = time;
      return false;
    }
    const elapsed = (time - this._start) / 1000;
    this._start = time;
    this.time += elapsed;
    this._input.update(elapsed);

    for (let i = 0; i < this.swarm.length; ++i) {
      const v = this.swarm[i];
      if (this.time < 6) {
        v.moveForward(elapsed);
        v.yawRight((2 * Math.PI) / 180);
      } else {
        v.pitchDown((1 * Math.PI) / 180);
        v.yawRight((2 * Math.PI) / 180);
        v.changePosition(0, -0.2, 0);
      }
    }

    this.orbit.rotate(-0.01, 0, 1, 0);
    // console.log(this.offsetPlatformPhysical.position.toString());
    this.offsetPlatformPhysical.moveLeft(elapsed);
    this.offsetPlatformPhysical.yawLeft((0.1 * Math.PI) / 180);
    // console.log(this.offsetPlatformPhysical.position.toString());

    // console.log("Cam: " + this.camera.getOrientation());
    return false;
  }

  setBackground(...args: any[]): void {
    if (args.length > 1 || typeof args[0] === "number") {
      const c = new Color(args[0], args[1], args[2], args[3]);
      return this.setBackground(c);
    }
    if (!(args[0] instanceof Color)) {
      throw new Error("setBackground takes a color");
    }
    this._backgroundColor = args[0];

    // Make it simple to change the background color; do not require a
    // separate call to scheduleRepaint.
    this.scheduleRepaint();
  }

  /*
   * Marks this GLWidget as dirty and schedules a surface repaint.
   */
  scheduleRepaint() {
    this.paintingDirty = true;
    this._onUpdate.call();
  }

  setOnScheduleUpdate(cb: () => void, thisArg?: any) {
    this._onUpdate.set(cb, thisArg);
  }

  /*
   * Retrieves the current background color.
   */
  backgroundColor() {
    return this._backgroundColor;
  }

  Camera() {
    return this.camera;
  }

  gl() {
    return this._projector.glProvider().gl();
  }

  projector() {
    return this._projector;
  }

  unmount() {
    this._input.unmount();
  }

  /**
   * Render painted memory buffers.
   */
  render() {
    this._framerateOverlay.startRender();
    const width = this.projector().width();
    const height = this.projector().height();
    const projection = this.camera.updateProjection(width, height);

    this.projector().render();

    // local fullcam =
    //   boat:inverse() *
    //   player:inverse() *
    //   Bplayer:inverse() *
    //   cam:inverse()

    this.projector().glProvider().canvas().style.pointerEvents = "none";
    const gl = this.gl();
    gl.viewport(0, 0, width, height);
    gl.clearColor(this._backgroundColor[0], this._backgroundColor[1], this._backgroundColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    this.playerCluster.draw(
      this.playerAPhysical.getViewMatrix().multiplied(projection)
    );

    // console.log(
    //   "this.camera.getViewMatrix() *
    //   projection:\n" +
    //   viewMatrix.toString());
    // console.log(this.camera.getViewMatrix().toString());
    const viewMatrix = this.camera.getViewMatrix(null).multiplied(projection);
    this.worldCluster.draw(viewMatrix);

    for (let i = 0; i < this.swarm.length; ++i) {
      const v = this.swarm[i];
      this.testCluster.draw(v.getViewMatrix().multiplied(projection));
      // this.worldCluster.draw(v.getViewMatrix().multiplied(projection));
    }

    // console.log(projection.toString());
    // console.log(this.offsetPlatformPhysical.getViewMatrix().toString());
    const platformMatrix = this.offsetPlatformPhysical
      .getViewMatrix()
      .multiplied(projection);
    this.platformCluster.draw(platformMatrix);
    this.evPlatformCluster.draw(platformMatrix);

    this.playerCluster.draw(
      this.playerAPhysical.getViewMatrix().multiplied(projection)
    );

    this.testCluster.draw(
      this.playerBPhysical.getViewMatrix().multiplied(projection)
    );

    this.sphereCluster.draw(
      this.spherePhysical.getViewMatrix().multiplied(projection)
    );

    this._framerateOverlay.finishRender();
    this._framerateOverlay.draw(this.projector());

    return false;
  }
}
