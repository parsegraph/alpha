import BlockTypes from "./BlockTypes";
import { GLProvider } from "parsegraph-compileprogram";
import {
  Physical,
  alphaRandom,
  quaternionFromAxisAndAngle,
} from "parsegraph-physical";
import Block from "./Block";
import { BasicModel } from "./Model";

export default class WorldModel extends BasicModel {
  constructor(
    glProvider: GLProvider,
    blockTypes: BlockTypes,
    parent?: Physical,
    worldSize: number = 30
  ) {
    super(glProvider, parent);

    const MAX_TYPE = 23;
    const stone = blockTypes.find("stone", "cube");
    const grass = blockTypes.find("grass", "cube");
    for (let i = -worldSize; i <= worldSize; ++i) {
      for (let j = 1; j <= worldSize * 2; ++j) {
        const r = alphaRandom(0, MAX_TYPE);
        this.cluster().addBlock(
          new Block([grass, stone][alphaRandom(0, 1)], i, -1, -j, r)
        );
      }
    }
  }
}
