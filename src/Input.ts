import { AlphaCamera, Physical, BasicPhysical } from 'parsegraph-physical';
import Method from 'parsegraph-method';
import normalizeWheel from "parsegraph-normalizewheel";

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

export function alphaGetButtonName(buttonIndex: number) {
  switch (buttonIndex) {
    case 0:
      return "LeftMouseButton";
    case 2:
      return "RightMouseButton";
    case 1:
      return "MiddleMouseButton";
  }
  return null;
}

const DOM_EVENTS = [
  "mousedown", "mouseup", "mousemove", "wheel",
  "keydown", "keyup",
];

export default class AlphaInput {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  _done: boolean;

  mouseWheelUp: number;
  mouseWheelDown: number;

  mouseSensitivityX: number;
  mouseSensitivityY: number;

  _keyListener: Method;
  _onUpdate: Method;

  _camera: AlphaCamera;

  _buttons: Map<string, number>;

  _mounted: ()=>void;

  constructor(camera: AlphaCamera) {
    this.setMouseSensitivityX(0.005);
    this.setMouseSensitivityY(0.005);

    this._buttons = new Map();
    this._keyListener = new Method();

    this._onUpdate = new Method();

    this._camera = camera;
    this.startX = 0;
    this.endX = 0;
    this.startY = 0;
    this.endY = 0;
    this.mouseWheelUp = 0;
    this.mouseWheelDown = 0;
  }

  setOnScheduleUpdate(func: Function, obj?: any) {
    this._onUpdate.set(func, obj);
  }

  scheduleUpdate() {
    this._onUpdate.call();
  }

  handleEvent(eventType: string, eventData: Event) {
    const callListener = ()=>{
      switch (eventType) {
        case "wheel": return this.onWheel(eventData as WheelEvent);
        case "mousemove": return this.onMousemove(eventData as MouseEvent);
        case "mousedown": return this.onMousedown(eventData as MouseEvent);
        case "mouseup": return this.onMouseup(eventData as MouseEvent);
        case "keydown": return this.onKeydown(eventData as KeyboardEvent);
        case "keyup": return this.onKeyup(eventData as KeyboardEvent);
      }
    }
    if (callListener()) {
      eventData.preventDefault();
      this.scheduleUpdate();
    }
  }

  mount(cont: HTMLElement) {
    this.unmount();

    const handler = (e: Event)=>{
      this.handleEvent(e.type, e);
    };

    this._mounted = ()=>{
      DOM_EVENTS.forEach(eventType=>{
        cont.removeEventListener(eventType, handler);
      });
    };
    DOM_EVENTS.forEach(eventType=>{
      cont.addEventListener(eventType, handler);
    });
  }

  unmount() {
    if (!this._mounted) {
      return;
    }
    this._mounted();
    this._mounted = null;
  }

  onKeyup(event: KeyboardEvent) {
    this._buttons.delete(event.key.toLowerCase());
    return true;
  }

  onKeydown(event: KeyboardEvent) {
    if (this.onKeyDown(event.key)) {
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    this._buttons.set(event.key.toLowerCase(), Date.now());
    return true;
  }

  onMousedown(event: MouseEvent) {
    const button = alphaGetButtonName(event.button);
    const x = event.x;
    const y = event.y;
    this._buttons.set(button, Date.now());

    // reset for a new drag
    this.startX = x;
    this.startY = y;
    this.endX = x;
    this.endY = y;
    return true;
  }

  onMouseup(event: MouseEvent) {
    const button = alphaGetButtonName(event.button);
    const x = event.clientX;
    const y = event.clientY;
    this._buttons.delete(button);

    // new end point;
    this.endX = x;
    this.endY = y;
    return true;
  }

  onMousemove(event: MouseEvent) {
    const x = event.x;
    const y = event.y;
    this.endX = x;
    this.endY = y;
    return true;
  }

  onWheel(event: WheelEvent) {
    const wheel = normalizeWheel(event).spinY;
    if (wheel > 0) {
      this.mouseWheelUp = this.mouseWheelUp + wheel;
    } else {
      // keeping it positive!
      this.mouseWheelDown = this.mouseWheelDown - wheel;
    }
    return true;
  }

  onKeyDown(...args: any[]) {
    this._keyListener.call(...args);
    return false;
  }

  SetOnKeyDown(listener: Function, thisObject?: any) {
    this._keyListener.set(listener, thisObject);
  }

  get(key: string): number {
    return this._buttons.has(key) ? 1 : 0;
  }

  setMouseSensitivityX(sensitivity: number) {
    this.mouseSensitivityX = sensitivity;
  }

  getMouseSensitivityX() {
    return this.mouseSensitivityX;
  }

  setMouseSensitivityY(sensitivity: number) {
    this.mouseSensitivityY = sensitivity;
  }

  getMouseSensitivityY() {
    return this.mouseSensitivityY;
  }

  // quick set both of them
  setMouseSensitivity(sensitivity: number) {
    this.setMouseSensitivityX(sensitivity);
    this.setMouseSensitivityY(sensitivity);
  }

  mouseLeft() {
    if (this.endX < this.startX) {
      const change = this.startX - this.endX;
      // console.log("mouse has moved right " + change);
      return change * this.getMouseSensitivityX();
    }

    return 0;
  }

  mouseRight() {
    if (this.endX > this.startX) {
      const change = this.endX - this.startX;
      // console.log("mouse has moved left " + change);
      return change * this.getMouseSensitivityX();
    }

    return 0;
  }

  mouseUp() {
    if (this.endY > this.startY) {
      const change = this.endY - this.startY;
      // console.log("mouse has moved down " + change);
      return change * this.getMouseSensitivityY();
    }

    return 0;
  }

  mouseDown() {
    if (this.endY < this.startY) {
      const change = this.endY - this.startY;
      // console.log("mouse has moved up " + change);
      return change * this.getMouseSensitivityY();
    }

    return 0;
  }

  // mouse wheel data is stored in 1/8 of a degree
  // this returns how many ticks of a mousewheel of standard resolution
  // has been seen before an Input:update()
  MouseWheelUp() {
    return this.mouseWheelUp / 120;
  }

  MouseWheelDown() {
    return this.mouseWheelDown / 120;
  }

  mouseWheelDegreesUp() {
    return this.mouseWheelUp / 8;
  }

  mouseWheelDegreesDown() {
    return this.mouseWheelDown / 8;
  }

  camera() {
    return this._camera;
  }

  /*
   * Sets the start to the end, and clears mousewheel totals.
   */
  update(elapsed: number) {
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
    const camPhysical = this.camera().getParent() as BasicPhysical;
    camPhysical.turnLeft(this.get("LeftMouseButton") * this.mouseLeft() * elapsed);
    camPhysical.turnRight(this.get("LeftMouseButton") * this.mouseRight() * elapsed);
    camPhysical.pitchUp(-this.get("LeftMouseButton") * this.mouseUp() * elapsed);
    camPhysical.pitchDown(this.get("LeftMouseButton") * this.mouseDown() * elapsed);
    camPhysical.moveForward(this.mouseWheelDegreesUp() * elapsed);
    camPhysical.moveBackward(this.mouseWheelDegreesDown() * elapsed);
    // this.camera().zoomIn(this.get("y"), elapsed);
    // this.camera().ZoomOut(this.get("h"), elapsed);

    camPhysical.moveForward(100 * this.get("t") * elapsed);
    camPhysical.moveBackward(100 * this.get("g") * elapsed);
    camPhysical.moveLeft(100 * this.get("f") * elapsed);
    camPhysical.moveRight(100 * this.get("h") * elapsed);

    camPhysical.moveForward(this.get("w") * elapsed);
    camPhysical.moveBackward(this.get("s") * elapsed);
    camPhysical.moveLeft(this.get("a") * elapsed);
    camPhysical.moveRight(this.get("d") * elapsed);
    camPhysical.moveUp(this.get(" ") * elapsed);
    camPhysical.moveDown(this.get("Shift") * elapsed);

    camPhysical.yawLeft(this.get("j") * elapsed);
    camPhysical.yawRight(this.get("l") * elapsed);
    camPhysical.pitchUp(this.get("k") * elapsed);
    camPhysical.pitchDown(this.get("i") * elapsed);
    camPhysical.rollLeft(this.get("u") * elapsed);
    camPhysical.rollRight(this.get("o") * elapsed);

    if (this.get("RightMouseButton") > 0) {
      if (!this._done) {
        this.camera().alignParentToMy(0, 1);
        this._done = true;
      }
    } else {
      this._done = false;
    }
    this.startX = this.endX;
    this.startY = this.endY;
    this.mouseWheelUp = 0;
    this.mouseWheelDown = 0;
  }
}
