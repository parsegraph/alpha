import BlockTypes from "./BlockTypes";
import {GLProvider} from 'parsegraph-compileprogram';
import {
  Physical,
  quaternionFromAxisAndAngle,
} from "parsegraph-physical";
import Block from "./Block";
import {BasicModel} from './Model';

export default class SphereModel extends BasicModel {
  constructor(glProvider: GLProvider, blockTypes: BlockTypes, parent?: Physical) {
    super(glProvider, parent);

    const stone = blockTypes.find("stone", "cube");
    const grass = blockTypes.find("grass", "cube");
    const radius = 8;

    // first circle about the x-axis
    let rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(1, 0, 0, (rot * Math.PI) / 180);
      rot += 15;
      const p = q.rotatedVector(0, 0, -radius);
      this.cluster().addBlock(new Block(stone, p[0], p[1], p[2], 0));
    }

    rot = 0;
    for (let i = 0; i < 24; ++i) {
      const q = quaternionFromAxisAndAngle(0, 1, 0, (rot * Math.PI) / 180);
      rot += 15;

      const p = q.rotatedVector(0, 0, -radius);
      this.cluster().addBlock(new Block(grass, p[0], p[1], p[2], 0));
    }
  }

  tick(elapsedMs: number) {
    this.physical().yawLeft(elapsedMs / 2);
    return false;
  }
}

