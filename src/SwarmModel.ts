import { GLProvider } from "parsegraph-compileprogram";
import {
  Physical,
  BasicPhysical,
  alphaRandom,
  AlphaQuaternion,
  AlphaVector,
} from "parsegraph-physical";
import { BasicModel } from "./Model";

export default class SwarmModel extends BasicModel {
  swarm: BasicPhysical[];
  time: number;

  constructor(glProvider: GLProvider, parent?: Physical) {
    super(glProvider, parent);
    this.swarm = [];

    const spot = new AlphaVector(0, 15, 35);
    for (let i = 0; i < 10; ++i) {
      this.swarm.push(new BasicPhysical(this.physical()));
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
  }

  tick(elapsedMs: number) {
    this.time += elapsedMs;
    this.swarm.forEach((v) => {
      if (this.time < 6) {
        v.moveForward(elapsedMs);
        v.yawRight((2 * Math.PI) / 180);
      } else {
        v.pitchDown((1 * Math.PI) / 180);
        v.yawRight((2 * Math.PI) / 180);
        v.changePosition(0, -0.2, 0);
      }
    });
    return false;
  }
}
