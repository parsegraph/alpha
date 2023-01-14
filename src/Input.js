// Input Version 1.2.130825
// usage:
// local input = Input:New(glwidget)
// input:setMouseSensitivityX( .05 ) // defaults to .05
// input:setMouseSensitivityY( .05 ) // defaults to .05

// inside of a timing.every function
// Camera:moveForward( input:W() * elapsed );
// Camera:yawLeft( input:LeftMouseButton() * input:mouseLeft() )
// some non-obvious buttons are:
// LeftMouseButton, RightMouseButton, MiddleMouseButton, SPACE, RETURN, SHIFT
// mouseUp, mouseDown, mouseLeft, mouseRight

// for a simple if statement do:
//       if input:Q() > 0 then
// do stuff because Q is down
//       end

// MouseWheelUp()
// returns 1 or more if you have scrolled up recently
// mouseWheelDegreesUp()
// returns the number of degrees the wheel has scrolled recently

// add this to your code to make a command only work once per button push
/*
        if elapsed == 0 then
                done = false;
                return

        end
        if done then return end;
        done = true;
*/

export function AlphaInput(surface, camera) {
  this.setMouseSensitivityX(0.005);
  this.setMouseSensitivityY(0.005);

  this.surface = surface;
  this.camera = camera;
  this.startX = 0;
  this.endX = 0;
  this.startY = 0;
  this.endY = 0;
  this.mouseWheelUp = 0;
  this.mouseWheelDown = 0;
  this.grabbed = null;
}

AlphaInput.prototype.onKeyup = function (event) {
  this[event.key.toLowerCase()] = null;
  return true;
};

AlphaInput.prototype.onKeydown = function (event) {
  if (this.onKeyDown(event.key)) {
    return;
  }
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  this[event.key.toLowerCase()] = 1;
  return true;
};

export function alphaGetButtonName(buttonIndex) {
  switch (event.button) {
    case 0:
      return "LeftMouseButton";
    case 2:
      return "RightMouseButton";
    case 1:
      return "MiddleMouseButton";
  }
  return null;
}

AlphaInput.prototype.onMousedown = function (event) {
  const button = alphaGetButtonName(event.button);
  const x = event.x;
  const y = event.y;
  this[button] = 1;

  // reset for a new drag
  this.startX = x;
  this.startY = y;
  this.endX = x;
  this.endY = y;
  return true;
};

AlphaInput.prototype.onMouseup = function (event) {
  const button = alphaGetButtonName(event.button);
  const x = event.clientX;
  const y = event.clientY;
  this[button] = null;

  // new end point;
  this.endX = x;
  this.endY = y;
  return true;
};

AlphaInput.prototype.onMousemove = function (event) {
  const x = event.x;
  const y = event.y;
  this.endX = x;
  this.endY = y;
  return true;
};

AlphaInput.prototype.onWheel = function (event) {
  const wheel = event.spinY;
  if (wheel > 0) {
    this.mouseWheelUp = this.mouseWheelUp + wheel;
  } else {
    // keeping it positive!
    this.mouseWheelDown = this.mouseWheelDown - wheel;
  }
  return true;
};

AlphaInput.prototype.onKeyDown = function (...args) {
  if (this._keyDownListener) {
    return this._keyDownListener.apply(this._keyDownThisObject, args);
  }
  return false;
};

AlphaInput.prototype.SetOnKeyDown = function (listener, thisObject) {
  this._keyDownListener = listener;
  this._keyDownThisObject = thisObject;
};

AlphaInput.prototype.get = function (key) {
  return this[key] ? 1 : 0;
};

AlphaInput.prototype.setMouseSensitivityX = function (sensitivity) {
  this.mouseSensitivityX = sensitivity;
};

AlphaInput.prototype.getMouseSensitivityX = function () {
  return this.mouseSensitivityX;
};

AlphaInput.prototype.setMouseSensitivityY = function (sensitivity) {
  this.mouseSensitivityY = sensitivity;
};

AlphaInput.prototype.getMouseSensitivityY = function () {
  return this.mouseSensitivityY;
};

// quick set both of them
AlphaInput.prototype.setMouseSensitivity = function (sensitivity) {
  this.setMouseSensitivityX(sensitivity);
  this.setMouseSensitivityY(sensitivity);
};

AlphaInput.prototype.mouseLeft = function () {
  if (this.endX < this.startX) {
    const change = this.startX - this.endX;
    // console.log("mouse has moved right " + change);
    return change * this.getMouseSensitivityX();
  }

  return 0;
};

AlphaInput.prototype.mouseRight = function () {
  if (this.endX > this.startX) {
    const change = this.endX - this.startX;
    // console.log("mouse has moved left " + change);
    return change * this.getMouseSensitivityX();
  }

  return 0;
};

AlphaInput.prototype.mouseUp = function () {
  if (this.endY > this.startY) {
    const change = this.endY - this.startY;
    // console.log("mouse has moved down " + change);
    return change * this.getMouseSensitivityY();
  }

  return 0;
};

AlphaInput.prototype.mouseDown = function () {
  if (this.endY < this.startY) {
    const change = this.endY - this.startY;
    // console.log("mouse has moved up " + change);
    return change * this.getMouseSensitivityY();
  }

  return 0;
};

// mouse wheel data is stored in 1/8 of a degree
// this returns how many ticks of a mousewheel of standard resolution
// has been seen before an Input:update()
AlphaInput.prototype.MouseWheelUp = function () {
  return this.mouseWheelUp / 120;
};

AlphaInput.prototype.MouseWheelDown = function () {
  return this.mouseWheelDown / 120;
};

AlphaInput.prototype.mouseWheelDegreesUp = function () {
  return this.mouseWheelUp / 8;
};

AlphaInput.prototype.mouseWheelDegreesDown = function () {
  return this.mouseWheelDown / 8;
};

/*
 * Sets the start to the end, and clears mousewheel totals.
 */
AlphaInput.prototype.update = function (elapsed) {
  // console.log("Updating with elapsed: " + elapsed);
  if (this.get("Shift") > 0) {
    elapsed = elapsed * 10;
  }

  if (this.get("Shift") > 0) {
    elapsed = elapsed / 10;
  }

  // console.log("LeftMouseButton: " + this.get("LeftMouseButton"));
  // console.log("mouseLeft: " + this.mouseLeft() * elapsed);
  // console.log("mouseLeft: " +
  //   (this.get("LeftMouseButton") * this.mouseLeft() * elapsed));
  // console.log("LeftMouse: " + this.get("LeftMouseButton"));
  // console.log("turnLeft: " + this.mouseLeft() * elapsed);
  this.camera
    .getParent()
    .turnLeft(this.get("LeftMouseButton") * this.mouseLeft() * elapsed);
  this.camera
    .getParent()
    .turnRight(this.get("LeftMouseButton") * this.mouseRight() * elapsed);
  this.camera
    .getParent()
    .pitchUp(-this.get("LeftMouseButton") * this.mouseUp() * elapsed);
  this.camera
    .getParent()
    .pitchDown(this.get("LeftMouseButton") * this.mouseDown() * elapsed);
  this.camera.moveForward(this.mouseWheelDegreesUp() * elapsed);
  this.camera.moveBackward(this.mouseWheelDegreesDown() * elapsed);
  // this.camera.zoomIn(this.get("y"), elapsed);
  // this.camera.ZoomOut(this.get("h"), elapsed);

  this.camera.getParent().moveForward(100 * this.get("t") * elapsed);
  this.camera.getParent().moveBackward(100 * this.get("g") * elapsed);
  this.camera.getParent().moveLeft(100 * this.get("f") * elapsed);
  this.camera.getParent().moveRight(100 * this.get("h") * elapsed);

  this.camera.getParent().moveForward(this.get("w") * elapsed);
  this.camera.getParent().moveBackward(this.get("s") * elapsed);
  this.camera.getParent().moveLeft(this.get("a") * elapsed);
  this.camera.getParent().moveRight(this.get("d") * elapsed);
  this.camera.getParent().moveUp(this.get(" ") * elapsed);
  this.camera.getParent().moveDown(this.get("Shift") * elapsed);

  this.camera.getParent().yawLeft(this.get("j") * elapsed);
  this.camera.getParent().yawRight(this.get("l") * elapsed);
  this.camera.getParent().pitchUp(this.get("k") * elapsed);
  this.camera.getParent().pitchDown(this.get("i") * elapsed);
  this.camera.getParent().rollLeft(this.get("u") * elapsed);
  this.camera.getParent().rollRight(this.get("o") * elapsed);

  if (this.get("RightMouseButton") > 0) {
    if (!this._done) {
      this.camera.alignParentToMy(false, true);
      this._done = true;
    }
  } else {
    this._done = false;
  }
  this.startX = this.endX;
  this.startY = this.endY;
  this.mouseWheelUp = 0;
  this.mouseWheelDown = 0;
};
