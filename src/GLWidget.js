// TODO Blocks in foreground are rendered 
// improperly relative to the projection matrix.

// TODO Mouse input appears to be... strangely interpreted.
/* eslint-disable require-jsdoc, new-cap */

// test version 1.0
export function AlphaGLWidget(belt, window) {
  this._belt = belt;
  this._window = window;
  this._component = new Component(this, 'alphaGLWidget');
  this._component.setPainter(this.paint, this);
  this._component.setRenderer(this.render, this);
  this._component.setEventHandler(this.handleEvent, this);
  // this._component.setContextChanged(this.contextChanged, this);

  this._backgroundColor = new AlphaColor(0, 47 / 255, 57 / 255);

  this.camera = new AlphaCamera(this);
  this._start = new Date();

  // Set the field of view.
  this.camera.SetFovX(60);
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
  alphastandardBlockTypes(this.BlockTypes);
  alphaCubeMan(this.BlockTypes);

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
      const r = alpha_random(0, MAX_TYPE);
      this.worldCluster.AddBlock(
          [grass, stone][alpha_random(0, 1)],
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
  this.orbit.SetPosition(0, 0, 0);
  const elevator = new Physical(this.camera);
  elevator.SetPosition(0, 5, 0);

  this.camera.SetParent(this.camera);
  this.playerAPhysical = new Physical(this.camera);
  this.playerBPhysical = new Physical(this.camera);
  this.offsetPlatformPhysical = new Physical(this.camera);

  this.offsetPlatformPhysical.SetParent(this.camera);
  this.playerAPhysical.SetParent(this.offsetPlatformPhysical);
  this.playerBPhysical.SetParent(this.camera);

  this.camera.SetParent(this.playerBPhysical);

  this.playerAPhysical.SetPosition(10, 1, 0);

  this.playerBPhysical.SetPosition(0, 0, -3);

  this.offsetPlatformPhysical.SetPosition(0, 0, -25);
  this.offsetPlatformPhysical.YawLeft(0);
  this.offsetPlatformPhysical.RollRight(0);

  this.spherePhysical = new Physical(this.camera);
  this.spherePhysical.SetPosition(45, 0, 0);

  const radius = 8;
  this.sphereCluster = new AlphaCluster(this);

  // first circle about the x-axis
  let rot = 0;
  for (let i = 0; i < 24; ++i) {
    const q = alphaQuaternionFromAxisAndAngle(1, 0, 0, (rot * Math.PI) / 180);
    rot += 15;
    const p = q.RotatedVector(0, 0, -radius);
    this.sphereCluster.AddBlock(stone, p, 0);
  }

  rot = 0;
  for (let i = 0; i < 24; ++i) {
    const q = alphaQuaternionFromAxisAndAngle(0, 1, 0, (rot * Math.PI) / 180);
    rot += 15;

    const p = q.RotatedVector(0, 0, -radius);
    this.sphereCluster.AddBlock(stone, p, 0);
  }

  const spot = new AlphaVector(0, 15, 35);
  this.swarm = [];
  for (let i = 0; i < 10; ++i) {
    this.swarm.push(new Physical(this.camera));
    let x = alpha_random(1, 30);
    let y = alpha_random(1, 30);
    let z = alpha_random(1, 30);
    this.swarm[i].SetPosition(spot.Added(x, y, z));

    let x = alpha_random(-100, 100) / 100;
    let y = alpha_random(-100, 100) / 100;
    let z = alpha_random(-100, 100) / 100;
    const w = alpha_random(-100, 100) / 100;
    const q = new alpha_Quaternion(x, y, z, w);
    q.Normalize();
    this.swarm[i].SetOrientation(q);
  }

  this.time = 0;
} // AlphaGLWidget

AlphaGLWidget.prototype.component = function() {
  return this._component;
};

AlphaGLWidget.prototype.paint = function() {
  if (!this.paintingDirty) {
    return;
  }
  this.evPlatformCluster.CalculateVertices();
  this.testCluster.CalculateVertices();
  this.originCluster.CalculateVertices();
  this.playerCluster.CalculateVertices();
  this.worldCluster.CalculateVertices();
  this.platformCluster.CalculateVertices();
  this.sphereCluster.CalculateVertices();
  this.paintingDirty = false;
};

AlphaGLWidget.prototype.handleEvent = function(eventType, eventData) {
  if (eventType === 'tick') {
    this.Tick(parsegraph_elapsed(this._start));
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

AlphaGLWidget.prototype.Tick = function(elapsed) {
  elapsed /= 1000;
  this.time += elapsed;
  this._input.Update(elapsed);

  let ymin;
  for (let i = 0; i < this.swarm.length; ++i) {
    const v = this.swarm[i];
    if (this.time < 6) {
      v.MoveForward(elapsed);
      v.YawRight((2 * Math.PI) / 180);
    } else {
      v.PitchDown((1 * Math.PI) / 180);
      v.YawRight((2 * Math.PI) / 180);
      const y = v.GetPosition()[1];
      v.ChangePosition(0, -0.2, 0);
    }
  }

  this.orbit.Rotate(-0.01, 0, 1, 0);
  // console.log(this.offsetPlatformPhysical.position.toString());
  this.offsetPlatformPhysical.MoveLeft(elapsed);
  this.offsetPlatformPhysical.YawLeft((0.1 * Math.PI) / 180);
  // console.log(this.offsetPlatformPhysical.position.toString());

  // console.log("Cam: " + this.camera.GetOrientation());
};

AlphaGLWidget.prototype.setBackground = function(...args) {
  if (args.length > 1) {
    const c = new AlphaColor();
    c.Set.apply(c, ...args);
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
AlphaGLWidget.prototype.scheduleRepaint = function() {
  this.paintingDirty = true;
  this._belt.scheduleUpdate();
};

/*
 * Retrieves the current background color.
 */
AlphaGLWidget.prototype.backgroundColor = function() {
  return this._backgroundColor;
};

AlphaGLWidget.prototype.Camera = function() {
  return this.camera;
};

AlphaGLWidget.prototype.gl = function() {
  return this._window.gl();
};

/*
 * Render painted memory buffers.
 */
AlphaGLWidget.prototype.render = function(width, height, avoidIfPossible) {
  const projection = this.camera.UpdateProjection(width, height);

  // local fullcam = 
  //   boat:Inverse() * 
  //   player:Inverse() * 
  //   Bplayer:Inverse() * 
  //   cam:Inverse()

  const gl = this.gl();
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  this.playerCluster.Draw(
      this.playerAPhysical.GetViewMatrix().Multiplied(projection),
  );

  // console.log(
  //   "this.camera.GetViewMatrix() * 
  //   projection:\n" + 
  //   viewMatrix.toString());
  // console.log(this.camera.GetViewMatrix().toString());
  const viewMatrix = this.camera.GetViewMatrix().Multiplied(projection);
  this.worldCluster.Draw(viewMatrix);

  for (let i = 0; i < this.swarm.length; ++i) {
    const v = this.swarm[i];
    this.testCluster.Draw(v.GetViewMatrix().Multiplied(projection));
    // this.worldCluster.Draw(v.GetViewMatrix().Multiplied(projection));
  }

  // console.log(projection.toString());
  // console.log(this.offsetPlatformPhysical.GetViewMatrix().toString());
  const platformMatrix = this.offsetPlatformPhysical
      .GetViewMatrix()
      .Multiplied(projection);
  this.platformCluster.Draw(platformMatrix);
  this.evPlatformCluster.Draw(platformMatrix);

  this.playerCluster.Draw(
      this.playerAPhysical.GetViewMatrix().Multiplied(projection),
  );

  this.testCluster.Draw(
      this.playerBPhysical.GetViewMatrix().Multiplied(projection),
  );

  this.sphereCluster.Draw(
      this.spherePhysical.GetViewMatrix().Multiplied(projection),
  );
};
