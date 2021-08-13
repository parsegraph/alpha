// TODO Blocks in foreground are rendered 
// improperly relative to the projection matrix.

import { Color, Component } from "parsegraph-window";
import { standardBlockTypes } from "./BlockIDs";
import { AlphaBlockTypes } from "./BlockStuff";
import AlphaCamera from './Cam';
import AlphaCluster from "./Cluster";
import CubeMan from "./CubeMan";
import { AlphaInput } from "./Input";
import { AlphaVector, AlphaQuaternion, quaternionFromAxisAndAngle, alphaRandom } from "./Maths";
import Physical from "./Physical";
import {elapsed} from 'parsegraph-timing';

// TODO Mouse input appears to be... strangely interpreted.

// test version 1.0
export default class AlphaGLWidget extends Component {
  constructor(belt, window) {
    super();
    this._belt = belt;
    this._window = window;

    this._backgroundColor = new Color(0, 47 / 255, 57 / 255);

    this.camera = new AlphaCamera(this);
    this._start = new Date();

    // Set the field of view.
    this.camera.setFovX(60);
    // this.camera.SetProperFOV(2,2);

    // Set the camera's near and far distance.
    this.camera.SetFarDistance(1000);
    this.camera.SetNearDistance(1);

    this.paintingDirty = true;

    // this.camera.PitchDown(40 * Math.PI / 180);

    this._input = new AlphaInput(this, this.camera);
    this._input.SetMouseSensitivity(0.4);

    this._done = false;

    this.BlockTypes = new AlphaBlockTypes();
    standardBlockTypes(this.BlockTypes);
    CubeMan(this.BlockTypes);

    const cubeman = this.BlockTypes.Get('blank', 'cubeman');

    this.testCluster = new AlphaCluster(this);
    this.testCluster.AddBlock(cubeman, 0, 5, 0, 0);

    const stone = this.BlockTypes.Get('stone', 'cube');
    const grass = this.BlockTypes.Get('grass', 'cube');
    const dirt = this.BlockTypes.Get('dirt', 'cube');

    this.originCluster = new AlphaCluster(this);
    // this.originCluster.AddBlock(stone,0,0,-50,0);

    this.platformCluster = new AlphaCluster(this);
    this.worldCluster = new AlphaCluster(this);

    this.playerCluster = new AlphaCluster(this);

    for (let i = 0; i <= 2; ++i) {
      this.playerCluster.AddBlock(grass, 0, i, 0, 0);
    }

    this.playerCluster.AddBlock(grass, -1, 3, 0, 16); // left

    this.playerCluster.AddBlock(grass, 0, 4, 0, 12); // head

    this.playerCluster.AddBlock(grass, 1, 3, 0, 8); // right

    const WORLD_SIZE = 30;
    const MAX_TYPE = 23;
    for (let i = -WORLD_SIZE; i <= WORLD_SIZE; ++i) {
      for (let j = 1; j <= WORLD_SIZE * 2; ++j) {
        const r = alphaRandom(0, MAX_TYPE);
        this.worldCluster.AddBlock(
            [grass, stone][alphaRandom(0, 1)],
            i,
            -1,
            -j,
            r,
        );
      }
    }

  // build a platform

  for (let i = -3; i <= 3; ++i) {
    for (let j = -4; j <= 4; ++j) {
      this.platformCluster.AddBlock(grass, j, 0, -i, 0);
    }
  }

  this.evPlatformCluster = new AlphaCluster(this);
  for (let i = -2; i <= 2; ++i) {
    for (let j = 3; j <= 4; ++j) {
      this.evPlatformCluster.AddBlock(dirt, j, 1, i, 0);
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
  this.offsetPlatformPhysical.YawLeft(0);
  this.offsetPlatformPhysical.RollRight(0);

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
    this.sphereCluster.AddBlock(stone, p, 0);
  }

  rot = 0;
  for (let i = 0; i < 24; ++i) {
    const q = quaternionFromAxisAndAngle(0, 1, 0, (rot * Math.PI) / 180);
    rot += 15;

    const p = q.rotatedVector(0, 0, -radius);
    this.sphereCluster.AddBlock(stone, p, 0);
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
  this.evPlatformCluster.CalculateVertices();
  this.testCluster.CalculateVertices();
  this.originCluster.CalculateVertices();
  this.playerCluster.CalculateVertices();
  this.worldCluster.CalculateVertices();
  this.platformCluster.CalculateVertices();
  this.sphereCluster.CalculateVertices();
  this.paintingDirty = false;
  return true;
};

hasEventHandler() {
  return true;
}

handleEvent(eventType, eventData) {
  if (eventType === 'tick') {
    this.Tick(elapsed(this._start));
    this._start = new Date();
    return true;
  } else if (eventType === 'wheel') {
    return this._input.onWheel(eventData);
  } else if (eventType === 'mousemove') {
    return this._input.onMousemove(eventData);
  } else if (eventType === 'mousedown') {
    return this._input.onMousedown(eventData);
  } else if (eventType === 'mouseup') {
    return this._input.onMouseup(eventData);
  } else if (eventType === 'keydown') {
    return this._input.onKeydown(eventData);
  } else if (eventType === 'keyup') {
    return this._input.onKeyup(eventData);
  }
  return false;
};

Tick(elapsed) {
  elapsed /= 1000;
  this.time += elapsed;
  this._input.Update(elapsed);

  for (let i = 0; i < this.swarm.length; ++i) {
    const v = this.swarm[i];
    if (this.time < 6) {
      v.MoveForward(elapsed);
      v.YawRight((2 * Math.PI) / 180);
    } else {
      v.PitchDown((1 * Math.PI) / 180);
      v.YawRight((2 * Math.PI) / 180);
      v.changePosition(0, -0.2, 0);
    }
  }

  this.orbit.rotate(-0.01, 0, 1, 0);
  // console.log(this.offsetPlatformPhysical.position.toString());
  this.offsetPlatformPhysical.MoveLeft(elapsed);
  this.offsetPlatformPhysical.YawLeft((0.1 * Math.PI) / 180);
  // console.log(this.offsetPlatformPhysical.position.toString());

  // console.log("Cam: " + this.camera.getOrientation());
};

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
};

/*
 * Marks this GLWidget as dirty and schedules a surface repaint.
 */
scheduleRepaint() {
  this.paintingDirty = true;
  this._belt.scheduleUpdate();
};

/*
 * Retrieves the current background color.
 */
backgroundColor() {
  return this._backgroundColor;
};

Camera() {
  return this.camera;
};

gl() {
  return this._window.gl();
};

/*
 * Render painted memory buffers.
 */
render(width, height, avoidIfPossible) {
  const projection = this.camera.UpdateProjection(width, height);

  // local fullcam = 
  //   boat:inverse() * 
  //   player:inverse() * 
  //   Bplayer:inverse() * 
  //   cam:inverse()

  const gl = this.gl();
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  this.playerCluster.Draw(
      this.playerAPhysical.getViewMatrix().multiplied(projection),
  );

  // console.log(
  //   "this.camera.getViewMatrix() * 
  //   projection:\n" + 
  //   viewMatrix.toString());
  // console.log(this.camera.getViewMatrix().toString());
  const viewMatrix = this.camera.getViewMatrix().multiplied(projection);
  this.worldCluster.Draw(viewMatrix);

  for (let i = 0; i < this.swarm.length; ++i) {
    const v = this.swarm[i];
    this.testCluster.Draw(v.getViewMatrix().multiplied(projection));
    // this.worldCluster.Draw(v.getViewMatrix().multiplied(projection));
  }

  // console.log(projection.toString());
  // console.log(this.offsetPlatformPhysical.getViewMatrix().toString());
  const platformMatrix = this.offsetPlatformPhysical
      .getViewMatrix()
      .multiplied(projection);
  this.platformCluster.Draw(platformMatrix);
  this.evPlatformCluster.Draw(platformMatrix);

  this.playerCluster.Draw(
      this.playerAPhysical.getViewMatrix().multiplied(projection),
  );

  this.testCluster.Draw(
      this.playerBPhysical.getViewMatrix().multiplied(projection),
  );

  this.sphereCluster.Draw(
      this.spherePhysical.getViewMatrix().multiplied(projection),
  );
  return false;
};
};
