// -- Camera Version 2.1.130827
// -- TODO: learn more about projectionMatrix;
// -- TODO: disengage properly -- disable engage ( requires reparent )
// -- raytracing
// -- TODO: figure out aiming for third person

import { makePerspective } from "parsegraph-matrix";
import { toDegrees, toRadians } from "parsegraph-toradians";
import { AlphaQuaternion, AlphaRMatrix4, AlphaVector } from "./Maths";
import Physical from "./Physical";

// ----------------------------------------------
// ------------------- CAMERA  ------------------
// ----------------------------------------------
// -- camera is a special case of physical
// -- so special that I've opted to not "descend it"
// -- it is always following a physical
// -- and it passes information to and from physicals

// the function returned by Camera();
export default class AlphaCamera {
  constructor() {
    this.fovX = toRadians(60.1);
    this.fovY = 0;

    // zoomFactor = zoomSpeed ^ elapsed -- strange but yields a nice zoom
    this.zoomSpeed = 1;
    this.zoomFactor = 1;
    this.farDistance = 2500;
    this.nearDistance = 1; // with collision detection I may be able to increase this

    // Dimensions of the window's size.
    this.width = null;
    this.height = null;

    this.projectionDirty = true; // dirty until you call updateProjection();
    this.projectionMatrix = new AlphaRMatrix4();
    this.modelDirty = true;
    this.modelMatrix = new AlphaRMatrix4();
    this.viewMatrix = new AlphaRMatrix4();

    this.pitch = 0; // a check value
    this.rotationSpeed = [1, 1];
    this.maxRange = 50;
    this.speed = 5; // speed the camera changes range at
    this.orientation = new AlphaQuaternion();
    this.position = new AlphaVector();
    this.offset = new AlphaVector();
    this.reengage = null; // here for completeness sake, setting it to null does null

    // not using disengage because we are not engaged
    this.setParent(this.getInvisiblePhysical(this));
  }

  toJSON() {
    return {
      position: this.position.toJSON(),
      orientation: this.orientation.toJSON(),
    };
  }

  restore(json) {
    this.position.restore(json.position);
    this.orientation.restore(json.orientation);
    console.log(this.toJSON());
  }

  // ----------------------------------------------
  // ------------ PROJECTION MATRIX ---------------
  // ----------------------------------------------

  // -- we set FOV in degrees
  // -- we get in radians;
  setFovX(fovX) {
    this.fovX = toRadians(fovX);
    this.projectionDirty = true;
  }

  setFovY(fovY) {
    this.fovY = toRadians(fovY);
    this.projectionDirty = true;
  }

  etFovX() {
    // autoadjust if fovX == 0
    let fovX = this.fovX;
    if (!fovX || fovX == 0) {
      const aspect = this.width / this.height;
      fovX = this.fovY * aspect;
    }

    return fovX;
  }

  GetFovY() {
    let fovY = this.fovY;
    // autoadjust if fovY == 0
    if (!fovY || fovY == 0) {
      const aspect = this.width / this.height;
      fovY = this.fovX / aspect;
    }
    return fovY;
    // if you set them both to zero, you won't see anything. Working as expected.
  }

  // sets the fov
  // unless you have a huge screen and sit very close I do not recommend
  // width = width of the viewport
  // distance = distance of eyes from viewport
  // use the same units for both;
  SetProperFOV(vpWidth, eyeDistance) {
    const fovx = Math.atan((vpWidth * 0.5) / eyeDistance) * 2;
    this.setFovY(0); // set this to autoadjust;
    this.setFovX(toDegrees(fovx)); // and set this to the proper fov;
  }

  setZoom(factor) {
    if (factor < 1) {
      return false; // assholes
    }

    this.zoomFactor = factor;
    this.projectionDirty = true;
    return this.zoomFactor;
  }

  GetZoom() {
    return this.zoomFactor;
  }

  setZoomSpeed(speed) {
    this.zoomSpeed = speed;
    return this.zoomSpeed;
  }

  zoomIn(bind, elapsed) {
    if (!bind || bind <= 0) {
      return false;
    } else if (bind > 1) {
      bind = 1;
    }

    let zoom = this.zoomFactor + Math.pow(this.zoomSpeed, bind * elapsed);
    if (zoom < 1) {
      zoom = 1;
    }
    return this.setZoom(zoom);
  }

  ZoomOut(bind, elapsed) {
    if (!bind || !elapsed) {
      return false;
    }

    if (bind <= 0) {
      return false;
    } else if (bind > 1) {
      bind = 1;
    }

    let zoom = this.zoomFactor - Math.pow(this.zoomSpeed, bind * elapsed);
    if (zoom < 1) {
      zoom = 1;
    }
    return this.setZoom(zoom);
  }

  CancelZoom() {
    return this.setZoom(1);
  }

  // continues to zoom until the zoom is reached;
  // broken until I am less tired
  ZoomUntil(zoom, bind, elapsed) {
    if (!zoom || !bind || !elapsed) {
      return false;
    }
    if (bind <= 0) {
      return false;
    }

    const factor = this.zoomFactor;
    if (zoom > factor) {
      // need to increase zoom;
      if (this.zoomIn(1, elapsed) > factor) {
        // oops we overshot
        this.setZoom(factor);
      }
    }
    if (zoom < factor) {
      // XXX
    }
  }

  // anything further than this is clipped
  setFarDistance(distance) {
    this.farDistance = distance;
    this.projectionDirty = true;
  }

  GetFarDistance() {
    return this.farDistance;
  }

  // anything nearer than this is clipped
  setNearDistance(distance) {
    this.nearDistance = distance;
    this.projectionDirty = true;
  }

  GetNearDistance() {
    return this.nearDistance;
  }

  updateProjection(width, height) {
    this.width = width;
    this.height = height;

    this.projectionMatrix.set(
      makePerspective(
        this.etFovX() / this.zoomFactor,
        this.width / this.height,
        this.nearDistance,
        this.farDistance
      )
    );
    this.projectionDirty = false;
    return this.projectionMatrix;
  }

  // -------------------------------------
  // ------------ Rotation ---------------
  // -------------------------------------

  setOrientation() {
    this.orientation.set(this.orientation, ...args);
    this.modelDirty = true;
  }

  // returns as Quaternion
  getOrientation() {
    return this.orientation;
  }

  // in radians / second
  SetRotationSpeeds(x, y) {
    const rSpeed = this.rotationSpeed;
    rSpeed[0] = x;
    rSpeed[1] = y;
  }

  GetRotationSpeeds() {
    const rSpeed = this.rotationSpeed;
    return rSpeed;
  }

  SetRotationSpeed(speed) {
    const rSpeed = this.rotationSpeed;
    rSpeed[0] = speed;
    rSpeed[1] = speed;
  }

  pitch(angle) {
    // if you aren't rotating about an angle, then you aren't rotating
    if (angle == 0) {
      return;
    }

    // preventing tons of tiny adjustments
    const pi_2 = Math.PI / 2;
    if (this.pitch >= pi_2 && angle > 0) {
      return false;
    }
    if (this.pitch <= -pi_2 && angle < 0) {
      return false;
    }

    let pitch = this.pitch + angle;

    if (pitch < -pi_2) {
      // reduce the angle so that it makes pitch == -pi;
      angle = -pi_2 - this.pitch;
      pitch = -pi_2;
    }

    if (pitch > pi_2) {
      // reduce the angle so that it makes pitch == pi;
      angle = pi_2 - this.pitch;
      pitch = pi_2;
    }

    this.pitch = pitch;
    // now rotate by that angle about the x axis;
    const q = new AlphaQuaternion();
    q.fromAxisAndAngle(1, 0, 0, angle);
    this.setOrientation(this.orientation.multiplied(q));
  }

  turn(angle) {
    // if you aren't rotating about an angle, then you aren't rotating
    if (angle == 0) {
      return;
    }

    const q = new AlphaQuaternion();
    q.fromAxisAndAngle(0, 1, 0, angle);
    this.setOrientation(q.multiply(this.getOrientation()));
  }

  // these rotations take place at the speeds set by rotationSpeed
  turnLeft(elapsed) {
    const angle = elapsed * this.rotationSpeed[1];
    this.turn(angle);
  }

  turnRight(elapsed) {
    const angle = elapsed * this.rotationSpeed[1];
    this.turn(-angle);
  }

  pitchUp(elapsed) {
    const angle = elapsed * this.rotationSpeed[0];
    if (angle !== 0) {
      // console.log("Pitch up " + angle);
      this.pitch(angle);
    }
  }

  pitchDown(elapsed) {
    const angle = elapsed * this.rotationSpeed[0];
    if (angle !== 0) {
      // console.log("Pitch down " + angle);
      this.pitch(angle);
    }
  }

  // set which axis you want to align to
  alignParentToMy(x, y) {
    let q = new AlphaQuaternion();
    if (x == 0) {
      x = false;
    }
    if (y == 0) {
      y = false;
    }
    const pitch = this.pitch;
    // no matter what, when we leave here there will be no pitch;
    this.pitch = 0;

    const parent = this.getParent();
    // if we want to match yaw only
    if (y && !x) {
      // find the quaternion of our pitch; inverted.
      q.fromAxisAndAngle(1, 0, 0, -pitch);
      // our yaw in player space
      q = parent
        .getOrientation()
        .multiplied(this.getOrientation())
        .multiplied(q);
      // set the parent to the new quaternion
      parent.setOrientation(q);
      // set the camera to default identity
      // these makes the camera not move
      this.setOrientation(0, 0, 0, 1);
      // set our pitch back to where it was
      this.pitch(pitch);
    }
    // if we want to match pitch only
    // no idea why you would want to do this
    else if (x && !y) {
      // the quaternion of our pitch
      q.fromAxisAndAngle(1, 0, 0, pitch);
      // our pitch in parent space;
      q = parent.getOrientation().multiplied(q);
      parent.setOrientation(q);
      this.setOrientation(0, 0, 0, 1);

      // not bothering to set our yaw back to where it was because
      // this option shouldn't be used
      // it's bizarre

      // match pitch and yaw with the camera
    } else {
      // camera's orientation in parent space
      q = parent.getOrientation().multiplied(this.getOrientation());
      parent.setOrientation(q);
      this.setOrientation(0, 0, 0, 1);
    }
  }

  // -------------------------------------
  // ------------ POSITION ---------------
  // -------------------------------------

  // send as x,y,z or vector
  setPosition(x, y, z) {
    // console.log(new Error("Setting position to " + x + " " + y + " " + z));
    if (y == undefined) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    this.position.set(x, y, z);
    this.modelDirty = true;
    return this.position;
  }

  SetRange(range) {
    return this.setPosition(0, 0, range);
  }

  // return as Vector
  getPosition() {
    return this.position;
  }

  changePosition(x, y, z) {
    if (y === undefined) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    this.setPosition(this.position.added(x, y, z));
  }

  // offset from the physical
  setOffset(x, y, z) {
    if (y == undefined) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    this.offset.set(x, y, z);
    this.modelDirty = true;
  }

  // return as Vector
  GetOffset() {
    return this.offset;
  }

  ChangeOffset(x, y, z) {
    if (y == undefined) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    this.setOffset(this.offset.added(x, y, z));
  }

  // ------------------------------------------
  // -----------  MOVEMENT --------------------
  // ------------------------------------------

  SetMaxRange(maxRange) {
    this.maxRange = maxRange;
    return this.maxRange;
  }

  GetMaxRange() {
    return this.maxRange;
  }

  // camera movement is easy; it can only move in and out
  warp(distance) {
    const z = this.position[2];

    // preventing tons of tiny adjustments
    if (z <= 0 && distance < 0) {
      return;
    }
    if (z >= this.maxRange && distance > 0) {
      return;
    }

    // add it to our current position to get our new position
    /* var cz = z + distance;
      if(cz < 0) {
          distance = -z;
      }
      if(cz > this.maxRange) {
          distance = this.maxRange - z;
      }*/

    this.changePosition(0, 0, distance);
  }

  WarpIn(distance) {
    this.warp(-distance);
  }

  WarpOut(distance) {
    this.warp(distance);
  }
  // alias for end-user use

  // ------------------------------------------
  // --------------- VELOCITY -----------------
  // ------------------------------------------

  // -- since we can only move in one direction
  // -- there isn't any velocity
  // -- these are the commands needed for expected movement
  SetSpeed(speed) {
    this.speed = speed;
  }

  GetSpeed() {
    return this.speed;
  }

  moveForward(elapsed) {
    const distance = elapsed * this.speed;
    this.warp(-distance);
  }

  moveBackward(elapsed) {
    const distance = elapsed * this.speed;
    this.warp(distance);
  }

  // ------------------------------------------
  // --------------  PARENTING ----------------
  // ------------------------------------------

  // CAMERAS MAKE THE BEST PARENTS
  isGoodLineageFor(prospectiveChild) {
    return true;
  }

  getInvisiblePhysical(parent) {
    let position;
    let orientation;

    if (this.parent) {
      const currentParent = this.getParent();
      position = currentParent.getPosition();
      orientation = currentParent.getOrientation();
    } else {
      // this shouldn't happen outside of construction;
      position = this.position;
      orientation = this.orientation;
    }

    const p = new Physical(this);
    p.setPosition(position);
    p.setOrientation(orientation);
    if (this.parent) {
      p.setParent(this.parent);
    }
    return p;
  }

  // enables free floating
  disengage() {
    if (!this.freefloating) {
      this.reengage = this.parent;
      this.setParent(this.getInvisiblePhysical(this));
      this.freefloating = true;
    }
  }

  // sends it back to its previous physical
  engage() {
    if (this.freefloating) {
      // this.parent.Destroy(); // get rid of the invisible fucker
      // if called from setparent reengage is already updated
      // just set this bool so we don't go in an infinite loop
      // been there, it sucks  -- GOD
      this.freefloating = false;
      this.setParent(this.reengage);
      this.reengage = this.parent;
    }
  }

  setParent(parent) {
    // setting the camera to itself sets it to an invisble physical
    if (this == parent) {
      this.disengage();
      return;
    }

    // drunken me says this works
    // lets see if he is as stupid as I suspect;
    if (this.freefloating) {
      this.reengage = parent;
      this.engage();
      return;
    } else {
      this.reengage = this.parent; // who we reengage to;
    }

    this.parent = parent;
  }

  getParent() {
    return this.parent;
  }

  // ----------------------------------------------
  // ------------- MODELVIEW MATRIX ---------------
  // ----------------------------------------------

  // -- combine position, offset and orientation into a matrix;
  getModelMatrix() {
    if (this.modelDirty) {
      const p = this.position;
      const o = this.offset;
      const r = this.orientation;
      // console.log("position=", p.toString());
      // console.log("offset=", o.toString());
      // console.log("orientation=", r.toString());
      this.modelMatrix.fromVectorAroundQuaternionAtVector(p, r, o); // oh yea;
      // console.log("modelMat=", this.modelMatrix.toString());
      this.modelDirty = false;
    }
    return this.modelMatrix;
  }

  // it chains backwards until it finds a parent of itself;
  // sees as
  // C -> A -> B -> C
  // Stops:----^
  // Mults as (C * A * B):inverse()
  getViewMatrix(requestor) {
    const parent = this.parent;
    if (requestor) {
      // the camera is always loaded first(properly)
      // therefore if something other than the camera asks for camera info
      // simply give it to them.
      return this.viewMatrix;
    } else {
      requestor = this;
    }

    // console.log("this.modelMatrix:\n" + this.getModelMatrix());
    if (parent && parent != requestor) {
      const ancestors = parent.getViewMatrix(requestor);
      // console.log("this.modelMatrix:\n" + this.getModelMatrix());
      // console.log("parent.viewMatrix:\n" + ancestors.toString());
      // console.log("modelMatrix * ancestors:\n" + this.getModelMatrix().multiplied(ancestors));
      this.viewMatrix = this.getModelMatrix().multiplied(ancestors);
      // console.log("this.viewMatrix:\n" + this.viewMatrix.toString());
      return this.viewMatrix;
    } else {
      // you could also do a dummy identity matrix as the ancestor
      // but why do extra math?
      return this.getModelMatrix().inversed();
    }
  }
}

/*
const TestSuite = require('parsegraph-testsuite').default;
const alpha_Camera_Tests = new TestSuite('alpha_Camera');

alpha_Camera_Tests.addTest('alpha_Camera', function(resultDom) {
  const window = new parsegraph_Window();
  const widget = new alpha_GLWidget(window);
  const cam = new alpha_Camera();

  // console.log(cam.getModelMatrix().toString());
  cam.getViewMatrix();
});
*/
