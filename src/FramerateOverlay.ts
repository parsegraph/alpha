import { Projector } from "parsegraph-projector";

export class TimeRange<T = any> {
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

export default class FramerateOverlay {
  _frames: TimeRange[];
  _currentPaint: TimeRange;
  _currentRender: TimeRange;

  _startTime: number;

  constructor() {
    this._frames = [];
    this._currentRender = null;
    this._currentPaint = null;

    this._startTime = NaN;
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

    this._frames.forEach((range, i) => {
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
    if (isNaN(this._startTime)) {
      this._startTime = Date.now();
    }
    const d = Date.now() - this._startTime;
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

