import BlockTypes from "./BlockTypes";
import { GLProvider } from "parsegraph-compileprogram";
import { Physical } from "parsegraph-physical";
import Block from "./Block";
import { BasicModel } from "./Model";

export default class PlatformModel extends BasicModel {
  constructor(
    glProvider: GLProvider,
    blockTypes: BlockTypes,
    parent?: Physical
  ) {
    super(glProvider, parent);
    const grass = blockTypes.find("grass", "cube");
    const dirt = blockTypes.find("dirt", "cube");

    for (let i = -3; i <= 3; ++i) {
      for (let j = -4; j <= 4; ++j) {
        this.cluster().addBlock(new Block(grass, j, 0, -i, 0));
      }
    }

    for (let i = -2; i <= 2; ++i) {
      for (let j = 3; j <= 4; ++j) {
        this.cluster().addBlock(new Block(dirt, j, 1, i, 0));
      }
    }
  }
}
