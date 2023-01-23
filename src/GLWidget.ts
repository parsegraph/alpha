// TODO Blocks in foreground are rendered
// improperly relative to the projection matrix.

import Color from "parsegraph-color";
import { Projector } from "parsegraph-projector";
import BlockTypes from "./BlockTypes";
import {
  AlphaCamera,
} from "parsegraph-physical";
import AlphaInput from "./Input";

import { Renderable } from "parsegraph-timingbelt";
import Method from "parsegraph-method";

import FramerateOverlay from './FramerateOverlay';
import Model from './Model';

// TODO Mouse input appears to be... strangely interpreted.

export type TickFunc = (elapsedMs: number)=>boolean;

// test version 1.0
export default class AlphaGLWidget implements Renderable {
  _backgroundColor: Color;
  camera: AlphaCamera;
  _tickStart: number;
  paintingDirty: boolean;
  _input: AlphaInput;
  blockTypes: BlockTypes;
  _onUpdate: Method;

  _models: Model[];
  _updates: TickFunc[];

  _projector: Projector;

  _framerateOverlay: FramerateOverlay;

  constructor(projector: Projector, blockTypes: BlockTypes) {
    this._framerateOverlay = new FramerateOverlay();
    this._projector = projector;
    this._backgroundColor = new Color(0, 47 / 255, 57 / 255);

    this.camera = new AlphaCamera();
    this._tickStart = NaN;
    this._onUpdate = new Method();

    // Set the field of view.
    this.camera.setFovX(60);
    // this.camera.SetProperFOV(2,2);

    // Set the camera's near and far distance.
    this.camera.setFarDistance(1000);
    this.camera.setNearDistance(1);
    this.camera.setParent(this.camera);

    this.paintingDirty = true;

    // this.camera.pitchDown(40 * Math.PI / 180);

    this._input = new AlphaInput(this.camera);
    this._input.setOnScheduleUpdate(() => {
      this.scheduleRepaint();
    });
    this._input.setMouseSensitivity(0.4);
    this._input.mount(this.projector().container());

    this.blockTypes = blockTypes;

    this._models = [];
    this._updates = [];
  } // AlphaGLWidget

  addToScene(obj: Model) {
    this._models.push(obj);
    this.scheduleRepaint();
  }

  addTick(func: TickFunc) {
    this._updates.push(func);
    this.scheduleRepaint();
  }

  glProvider() {
    return this.projector().glProvider();
  }

  paint() {
    if (!this.paintingDirty) {
      return false;
    }
    this._framerateOverlay.startPaint();
    const blockTypes = this.blockTypes;
    this._models.forEach(model=>{
      model.cluster().calculateVertices(blockTypes);
    });
    this.paintingDirty = false;
    this._framerateOverlay.finishPaint();
    return true;
  }

  tick(time: number) {
    if (isNaN(this._tickStart)) {
      this._tickStart = time;
      return false;
    }
    const elapsed = (time - this._tickStart) / 1000;
    this._tickStart = time;
    this._input.update(elapsed);

    let needsUpdate = this._updates.reduce((needsUpdate, func)=>{
      return func(elapsed) || needsUpdate;
    }, false);

    needsUpdate = this._models.reduce((needsUpdate, model)=>{
      return model.tick(elapsed) || needsUpdate;
    }, needsUpdate);

    // console.log("Cam: " + this.camera.getOrientation());
    return needsUpdate;
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
    gl.clearColor(
      this._backgroundColor[0],
      this._backgroundColor[1],
      this._backgroundColor[2],
      1
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // console.log(
    //   "this.camera.getViewMatrix() *
    //   projection:\n" +
    //   viewMatrix.toString());
    // console.log(this.camera.getViewMatrix().toString());

    // console.log(projection.toString());

    this._models.forEach(model=>{
      model.cluster().draw(
        model.physical().getViewMatrix(null).multiplied(projection)
      )
    });

    this._framerateOverlay.finishRender();
    this._framerateOverlay.draw(this.projector());

    return false;
  }
}
