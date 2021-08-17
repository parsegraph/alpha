/* eslint-disable require-jsdoc */
// Physical version 1.4.130828
// physical is an orientation and a position
// as well as rotation and movement

// TODO change the rotation movement speeds from x,y,z to forward, backward,left,right, etc
// // really front/back up/down lateral(surely we don't want crippled things )
// // // this also requires rethinking the movement; because moveforward/backward won't cancel anymore
// TODO: scaling
// TODO: tilt
// TODO: Children
// TODO: acceleration

import TestSuite from 'parsegraph-testsuite';
import { AlphaQuaternion, AlphaRMatrix4, AlphaVector, quaternionFromAxisAndAngle } from './Maths';

// -----------------------------------
// ------------ USAGE ----------------
// -----------------------------------

// local p = Physical();

// p:setPosition(x,y,z);
// p:changePosition(x,y,z); // adds to current global position
// p:rotate( angle, x, y, z ) // rotates at its current position, using p's x,y,z axes

// glMultMatrix( p() ) // applying the above

// -----------------------------------
// --------- BETTER USAGE ------------
// -----------------------------------
// speeds only apply to functions taking an elapsed parameter

// p:SetRotationSpeeds( x, y, z ) // radians / second per second per axis
// SetRotationSpeed( speed ) // sets all axes the same
// p:setSpeeds(x,y,z) // ( movement speeds ) units / second per axis

// p:yawLeft( elapsed ) // p:yawRight( elapsed )
// p:pitchUp( elapsed ) // p:pitchDown( elapsed )
// p:rollLeft( elapsed ) // p:rollRight( elapsed )

// instantly update your global position when you call these
// p:WarpForward( distance ) // p:WarpBackward( distance )
// p:WarpLeft( distance ) // p:WarpRight( distance )
// p:WarpUp( distance ) // p:WarpDown( distance )

// velocity is applied whenever you call p:applyVelocity() or p:GetMatrix()
// velocity will adjust your current position by the velocity;
// p:SetVelocity(x,y,z);

// a simpler way to use velocity is to use these:
// it will be automatically calculated using our set speeds;

// p:moveForward( elapsed ) // p:moveBackward( elapsed )
// p:moveLeft( elapsed ) // p:moveRight( elapsed )
// p:moveUp( elapsed ) // p:moveDown( elapsed )

// XXX: for some reason I have to inverse quaterions for physical
// not for the camera. I do not understand why.

export const PHYSICAL_TRANSLATE_ROTATE_SCALE = 1;
export const PHYSICAL_SCALE_ROTATE_TRANSLATE = 2;
export const PHYSICAL_ROTATE_TRANSLATE_SCALE = 3;

export default function Physical(parent) {
  this.modelMode = PHYSICAL_TRANSLATE_ROTATE_SCALE;
  this.orientation = new AlphaQuaternion();
  this.position = new AlphaVector();
  this.modelMatrix = new AlphaRMatrix4();
  this.viewMatrix = new AlphaRMatrix4();
  this.modelDirty = false; // whether or not the matrix needs to be updated;
  this.velocity = new AlphaVector();
  this.rotationSpeed = new AlphaVector(1, 1, 1);
  this.speed = new AlphaVector(5, 5, 5);
  this.scale = new AlphaVector(1, 1, 1);
  this.setParent(parent);
}

Physical.prototype.toJSON = function() {
  return {
    position: this.position.toJSON(),
    orientation: this.orientation.toJSON(),
  };
};

// Register the test suite.
const alphaPhysicalTests = new TestSuite('Physical');

alphaPhysicalTests.addTest('Physical', function(resultDom) {
  const surface = new GLWidget();
  const cam = new Camera(surface);
  const p = new Physical(cam);
  return p;
});

// -----------------------------------
// ---------- Rotation ---------------
// -----------------------------------

Physical.prototype.setOrientation = function(...args) {
  this.orientation.set.apply(this.orientation, ...args);
  this.modelDirty = true;
};

/*
 * returns as Quaternion
 */
Physical.prototype.getOrientation = function() {
  return this.orientation;
};

/*
 * in radians / second
 */
Physical.prototype.SetRotationSpeeds = function(...args) {
  this.rotationSpeed.set.apply(this.rotationSpeed, ...args);
};
Physical.prototype.SetRotationSpeed =
  Physical.prototype.SetRotationSpeeds;

Physical.prototype.GetRotationSpeeds = function() {
  return this.rotationSpeed;
};

Physical.prototype.rotate = function(angle, x, y, z) {
  // if you aren't rotating about an angle, then you aren't rotating
  if (angle == 0) {
    return;
  }
  const q = quaternionFromAxisAndAngle(x, y, z, angle);
  this.orientation.multiply(q);
  this.modelDirty = true;
};

Physical.prototype.RotateGlobal = function(angle, x, y, z) {
  // if you aren't rotating about an angle, then you aren't rotating
  if (angle == 0) {
    return;
  }
  const q = quaternionFromAxisAndAngle(x, y, z, angle);
  this.orientation.set(q.multiply(this.orientation));
  this.modelDirty = true;
};

/*
 * these rotations take place at the speeds set by rotationSpeed
 */
Physical.prototype.yawLeft = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[1];
  this.rotate(angle, 0, 1, 0);
};

Physical.prototype.yawRight = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[1];
  this.rotate(-angle, 0, 1, 0);
};

Physical.prototype.pitchUp = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[0];
  this.rotate(angle, 1, 0, 0);
};

Physical.prototype.pitchDown = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[0];
  this.rotate(-angle, 1, 0, 0);
};

Physical.prototype.rollLeft = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[2];
  this.rotate(angle, 0, 0, 1);
};

Physical.prototype.rollRight = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[2];
  this.rotate(-angle, 0, 0, 1);
};

Physical.prototype.turn = function(angle) {
  // if you aren't rotating about an angle, then you aren't rotating
  if (angle == 0) {
    return;
  }

  const q = new AlphaQuaternion();
  q.fromAxisAndAngle(0, 1, 0, angle);
  this.setOrientation(q.multiply(this.getOrientation()));
};

Physical.prototype.turnLeft = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[1];
  this.turn(angle);
};

Physical.prototype.turnRight = function(elapsed) {
  const angle = elapsed * this.rotationSpeed[1];
  this.turn(-angle);
};

// -------------------------------------
// ------------ POSITION ---------------
// -------------------------------------

/*
 * send as x,y,z
 */
Physical.prototype.setPosition = function(...args) {
  if (Number.isNaN(this.position[0])) {
    throw new Error('Position became NaN.');
  }
  this.position.set.call(this.position, ...args);
  this.modelDirty = true;
};

/*
 * return as Vector
 */
Physical.prototype.getPosition = function() {
  return this.position;
};

Physical.prototype.changePosition = function(...args) {
  if (Number.isNaN(this.position[0])) {
    throw new Error('Position became NaN!');
  }
  this.position.add.call(this.position, ...args);
  this.modelDirty = true;
};

// ------------------------------------------
// -----------  MOVEMENT --------------------
// ------------------------------------------
// movement is relative to the physical

/*
 * convertes the local x,y,z vector to the global position vector
 */
Physical.prototype.warp = function(...args) {
  let x;
  let y;
  let z;
  if (args.length > 1) {
    x = args[0];
    y = args[1];
    z = args[2];
  } else {
    x = args[0][0];
    y = args[0][1];
    z = args[0][2];
  }
  if (x == 0 && y == 0 && z == 0) {
    return;
  }

  // Quaternions don't work correctly if they aren't normalized
  this.orientation.normalize();

  // get our new position; if we started at 0,0,0
  const d = this.orientation.rotatedVector(x, y, z);

  // add it to our current position to get our new position
  // console.log("Warping vec" + d);
  this.changePosition(d);
};

// these movement commands MOVE the physical
// the physical's position is updated in the call
// use the Move commands for player-commanded movement
Physical.prototype.WarpForward = function(distance) {
  this.warp(0, 0, -distance);
};

Physical.prototype.WarpBackward = function(distance) {
  this.warp(0, 0, distance);
};

Physical.prototype.WarpLeft = function(distance) {
  this.warp(-distance, 0, 0);
};

Physical.prototype.WarpRight = function(distance) {
  this.warp(distance, 0, 0);
};

Physical.prototype.WarpUp = function(distance) {
  this.warp(0, distance, 0);
};

Physical.prototype.WarpDown = function(distance) {
  this.warp(0, -distance, 0);
};

// ------------------------------------------
// -----------  VELOCITY --------------------
// ------------------------------------------

// speed is in units per second
Physical.prototype.setSpeeds = function(...args) {
  this.speed.set.call(this.speed, ...args);
};

Physical.prototype.GetSpeeds = function() {
  return this.speed;
};

Physical.prototype.SetSpeed = function(speed) {4
  return this.setSpeeds(speed, speed, speed);
};

Physical.prototype.SetVelocity = function(...args) {
  this.velocity.set.call(this.velocity, ...args);
};

Physical.prototype.GetVelocity = function() {
  return this.velocity;
};

Physical.prototype.addVelocity = function(...args) {
  this.velocity.add.call(this.velocity, ...args);
  this.modelDirty = true;
};

// Move commands adjust the velocity
// using the set speed
Physical.prototype.moveForward = function(elapsed) {
  const distance = elapsed * this.speed[2];
  this.addVelocity(0, 0, -distance);
};

Physical.prototype.moveBackward = function(elapsed) {
  const distance = elapsed * this.speed[2];
  this.addVelocity(0, 0, distance);
};

Physical.prototype.moveLeft = function(elapsed) {
  const distance = elapsed * this.speed[0];
  this.addVelocity(-distance, 0, 0);
};

Physical.prototype.moveRight = function(elapsed) {
  const distance = elapsed * this.speed[0];
  this.addVelocity(distance, 0, 0);
};

Physical.prototype.moveUp = function(elapsed) {
  const distance = elapsed * this.speed[1];
  this.addVelocity(0, distance, 0);
};

Physical.prototype.moveDown = function(elapsed) {
  const distance = elapsed * this.speed[1];
  this.addVelocity(0, -distance, 0);
};

// calculates our new position using our current velocity
// and then resets the velocity
Physical.prototype.applyVelocity = function() {
  this.warp(this.velocity);
  this.velocity.set(0, 0, 0);
};

// ------------------------------------------
// --------------  PARENTING ----------------
// ------------------------------------------

// in order to be a good lineage:
// a camera must be reached
// // therefore it must not infinitely loop
Physical.prototype.isGoodLineageFor = function(prospectiveChild) {
  const parent = this.getParent();

  // no parent = no lineage
  if (!parent) {
    return false;
  } else if (parent == prospectiveChild) {
    // the initator already has this physical as an ancestor
    // setting this as a parent would make an infinite loop
    return false;
    // note that we don't check self == prospectiveChild
    // that would throw an error if you tried to reparent to the same parent
    // it's assumed that if its a parent now, its still a good parent;
  }

  return parent.isGoodLineageFor(prospectiveChild);
};

Physical.prototype.setParent = function(parent) {
  if (!parent) {
    throw new Error(
        'A Physical must have a parent. set it to the camera for a default',
    );
  }

  if (!parent.isGoodLineageFor(this)) {
    throw new Error(
        'Setting this is a parent would result in a lineage that never reaches the camera',
    );
  }
  this.parent = parent;
};

Physical.prototype.getParent = function() {
  return this.parent;
};

// ------------------------------------------
// -----------  MODELVIEW MATRIX ------------
// ------------------------------------------

Physical.prototype.SetScale = function(...args) {
  this.scale.set(...args);
  this.modelDirty = true;
};

Physical.prototype.GetScale = function() {
  return this.scale;
};

// combine our position and orientation into a matrix;
Physical.prototype.getModelMatrix = function() {
  const x = this.velocity[0];
  const y = this.velocity[1];
  const z = this.velocity[2];
  if (x != 0 || y != 0 || z != 0) {
    this.applyVelocity();
  }

  // if w == 1 then a 4d vector is a position
  // if w == 0 then a 4d vector is a direction
  if (this.modelDirty) {
    // this.modelMatrix = rotation * translation;
    // this.modelMatrix.FromQuaternionAtVector(self.orientation, self.position);
    const m = this.modelMatrix;
    // this.modelMatrix = rotate * translate * identity
    m.identity();

    switch (this.modelMode) {
      case PHYSICAL_TRANSLATE_ROTATE_SCALE:
        m.translate(this.position);
        m.rotate(this.orientation);
        m.scale(this.scale);
        break;
      case PHYSICAL_SCALE_ROTATE_TRANSLATE:
        m.scale(this.scale);
        m.rotate(this.orientation);
        m.translate(this.position);
        break;
      case PHYSICAL_ROTATE_TRANSLATE_SCALE:
        m.rotate(this.orientation);
        m.translate(this.position);
        m.scale(this.scale);
        break;
      default:
        throw new Error(
            'Model mode must be an expected value: ' + this.modelMode,
        );
    }

    this.modelDirty = false;
  }

  return this.modelMatrix;
};

// when fully returned it looks like this
// A -> B -> CAM -> A -> B
// Mults as A * B * (CAM * A * B):inverse()

// in order for this to work properly make sure that the camera's
// getViewMatrix() is called before any physicals
// otherwise the physical's will be outdated
// this is to prevent having to retrace the camera's lineage more than once

// this would be a good thing to do for any matrix that has many descendants
// say a ship with lots of npcs / players on it

// but this would require a proper ordering of physicals
// which isn't feasible atm
// physicals would need to know who is the child of who.
// something like:
/*
        camera:CalculateViewMatrix();
        while SomePhysicalsNotCalculated do
                for all physicalsNotCalculated do
                        if parentPhysicalCalculated then
                                physical:CalculateViewMatrix()
                        end
                end
        end
*/

// a more feasible method would be to
// to have a bunch of children known by the physical
// then we simply chain down the list starting at the camera;
// this is a far better solution.
/*
        function CalculateViewMatrices()
                self:CalculateViewMatrix(); -- for myself
                for each child in children do
                        child:CalculateViewMatrices() -- for my children
                end
        end
*/
// it starts with a simple camera:CalculateViewMatrices();
// I will return to this.

Physical.prototype.getViewMatrix = function(...args) {
  // if this was just called then we need to set who sent it
  let requestor;
  if (args.length == 0) {
    requestor = this;
  } else {
    requestor = args[0];
  }

  if (this.parent && this.parent != requestor) {
    this.viewMatrix = this.getModelMatrix().multiplied(
        this.parent.getViewMatrix(requestor),
    );
    return this.viewMatrix;
  } else {
    return this.getModelMatrix().inverse();
  }
};

Physical.prototype.GetWorldPositionByViewMatrix = function() {
  return new RMatrix4([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    this.position[0],
    this.position[1],
    this.position[2],
    1,
  ]).multiply(this.getViewMatrix().inverse());
};

// legacy code; left in case I try this again
// it does not work correctly, in all cases
Physical.prototype.getWorldPosition = function(requestor) {
  const parent = this.parent;
  if (parent && parent != requestor) {
    const rot = parent.getWorldOrientation(requestor);
    const pos = rot.rotatedVector(this.position);
    return pos.add(parent.getWorldPosition(requestor));
  }
  return this.position;
};

// legacy code; left in case I try this again
// it DOES work
Physical.prototype.getWorldOrientation = function(requestor) {
  const parent = this.parent;
  if (parent && parent != requestor) {
    return parent.getWorldOrientation(requestor).multiplied(this.orientation);
  }
  return self.orientation;
};