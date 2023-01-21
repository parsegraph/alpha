// TODO Blocks in foreground are rendered
// improperly relative to the projection matrix.

import { Color, Component } from "parsegraph-window";
import { standardBlockTypes } from "./BlockIDs";
import { AlphaBlockTypes } from "./BlockStuff";
import Physical, { AlphaCamera } from 'parsegraph-physical';
import AlphaCluster from "./Cluster";
import CubeMan from "./CubeMan";
import AlphaInput from "./Input";
import {
  AlphaVector,
  AlphaQuaternion,
  quaternionFromAxisAndAngle,
  alphaRandom,
} from "./Maths";
import { elapsed } from "parsegraph-timing";

import { Renderable } from 'parsegraph-timingbelt';

// TODO Mouse input appears to be... strangely interpreted.

// test version 1.0
export default class AlphaGLWidget implements Renderable {
  _backgroundColor: Color;
  camera: AlphaCamera;
  _start: Date;
  paintingDirty: boolean;
  _input: AlphaInput;
  _done: boolean;
  BlockTypes: AlphaBlockTypes;

  orbit: Physical;
  playerAPhysical: Physical;
  playerBPhysical: Physical;
  offsetPlatformPhysical: Physical;

  originCluster: AlphaCluster;
  playerCluster: AlphaCluster;
  worldCluster: AlphaCluster;
  platformCluster: AlphaCluster;
  evPlatformCluster: AlphaCluster;
  testCluster: AlphaCluster;
  sphereCluster: AlphaCluster;


  constructor() {
    this._backgroundColor = new Color(0, 47 / 255, 57 / 255);

    this.camera = new AlphaCamera();
    this._start = new Date();

    // Set the field of view.
    this.camera.setFovX(60);
    // this.camera.SetProperFOV(2,2);

    // Set the camera's near and far distance.
    this.camera.setFarDistance(1000);
    this.camera.setNearDistance(1);

    this.paintingDirty = true;

    // this.camera.pitchDown(40 * Math.PI / 180);

    this._input = new AlphaInput(this, this.camera);
    this._input.setMouseSensitivity(0.4);

    this._done = false;

    this.BlockTypes = new AlphaBlockTypes();
    standardBlockTypes(this.BlockTypes);
    CubeMan(this.BlockTypes);

    const cubeman = this.BlockTypes.get("blank", "cubeman");

    this.testCluster = new AlphaCluster(this);
    this.testCluster.addBlock(cubeman, 0, 5, 0, 0);

    const stone = this.BlockTypes.get("stone", "cube");
    const grass = this.BlockTypes.get("grass", "cube");
    const dirt = this.BlockTypes.get("dirt", "cube");

    this.originCluster = new AlphaCluster(this);
    // this.originCluster.addBlock(stone,0,0,-50,0);

    this.platformCluster = new AlphaCluster(this);
    this.worldCluster = new AlphaCluster(this);

    this.playerCluster = new AlphaCluster(this);

    for (let i = 0; i <= 2; ++i) {
      this.playerCluster.addBlock(grass, 0, i, 0, 0);
    }

    this.playerCluster.addBlock(grass, -1, 3, 0, 16); // left

    this.playerCluster.addBlock(grass, 0, 4, 0, 12); // head

    this.playerCluster.addBlock(grass, 1, 3, 0, 8); // right

    const WORLD_SIZE = 30;
    const MAX_TYPE = 23;
    for (let i = -WORLD_SIZE; i <= WORLD_SIZE; ++i) {
      for (let j = 1; j <= WORLD_SIZE * 2; ++j) {
        const r = alphaRandom(0, MAX_TYPE);
        this.worldCluster.addBlock(
          [grass, stone][alphaRandom(0, 1)],
          i,
          -1,
          -j,
          r
        );
      }
    }

    // build a platform

    for (let i = -3; i <= 3; ++i) {
      for (let j = -4; j <= 4; ++j) {
        this.platformCluster.addBlock(grass, j, 0, -i, 0);
      }
    }

    this.evPlatformCluster = new AlphaCluster(this);
    for (let i = -2; i <= 2; ++i) {
      for (let j = 3; j <= 4; ++j) {
        this.evPlatformCluster.addBlock(dirt, j, 1, i, 0);
      }
    }

    this.orbit = new Physical(this.camera);
    this.orbit.setPosition(0, 0, 0);
    const elevator = new Physical(this.camera);
    elevator.setPosition(0, 5, 0);

    this.camera.setParent(this.camera);
    this.playerAPhysical = new Physical(this.camera);
    this.playerBPhysical = new Physical(this.camera);
    this.offsetPlatformPhysical = new Physical(this.camera);

    this.offsetPlatformPhysical.setParent(this.camera);
    this.playerAPhysical.setParent(this.offsetPlatformPhysical);
    this.playerBPhysical.setParent(this.camera);

    this.camera.setParent(this.playerBPhysical);

    this.playerAPhysical.setPosition(10, 1, 0);

    this.playerBPhysical.setPosition(0, 0, -3);

    this.offsetPlatformPhysical.setPosition(0, 0, -25);
    this.offsetPlatformPhysical.yawLeft(0);
    this.offsetPlatformPhysical.rollRight(0);

    this.spherePhysical = new Physical(this.camera);
    this.spherePhysical.setPosition(45, 0, 0);

    const radius = 8;
    this.sphereCluster = new AlphaCluster(this);

    // first circle about the x-axis
    let rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(1, 0, 0, (rot * Math.PI) / 180);
      rot += 15;
      const p = q.rotatedVector(0, 0, -radius);
      this.sphereCluster.addBlock(stone, p, 0);
    }

    rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(0, 1, 0, (rot * Math.PI) / 180);
      rot += 15;

      const p = q.rotatedVector(0, 0, -radius);
      this.sphereCluster.addBlock(stone, p, 0);
    }

    const spot = new AlphaVector(0, 15, 35);
    this.swarm = [];
    for (let i = 0; i < 10; ++i) {
      this.swarm.push(new Physical(this.camera));
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

  paint() {
    if (!this.paintingDirty) {
      return false;
    }
    this.evPlatformCluster.calculateVertices();
    this.testCluster.calculateVertices();
    this.originCluster.calculateVertices();
    this.playerCluster.calculateVertices();
    this.worldCluster.calculateVertices();
    this.platformCluster.calculateVertices();
    this.sphereCluster.calculateVertices();
    this.paintingDirty = false;
    return true;
  }

  hasEventHandler() {
    return true;
  }

  handleEvent(eventType, eventData) {
    if (eventType === "tick") {
      this.tick(elapsed(this._start));
      this._start = new Date();
      return true;
    } else if (eventType === "wheel") {
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
    return false;
  }

  tick(elapsed) {
    elapsed /= 1000;
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
  }

  setBackground(...args) {
    if (args.length > 1) {
      const c = new AlphaColor();
      c.set.apply(c, ...args);
      return this.setBackground(c);
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
    this._belt.scheduleUpdate();
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
    return this._window.gl();
  }

  /*
   * Render painted memory buffers.
   */
  render(width, height, avoidIfPossible) {
    const projection = this.camera.updateProjection(width, height);

    // local fullcam =
    //   boat:inverse() *
    //   player:inverse() *
    //   Bplayer:inverse() *
    //   cam:inverse()

    const gl = this.gl();
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
    const viewMatrix = this.camera.getViewMatrix().multiplied(projection);
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
    return false;
  }
}
