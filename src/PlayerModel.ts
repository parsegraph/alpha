import BlockTypes from "./BlockTypes";
import { GLProvider } from "parsegraph-compileprogram";
import { Physical, quaternionFromAxisAndAngle } from "parsegraph-physical";
import Block from "./Block";
import { BasicModel } from "./Model";

export default class PlayerModel extends BasicModel {
  constructor(
    glProvider: GLProvider,
    blockTypes: BlockTypes,
    parent?: Physical
  ) {
    super(glProvider, parent);

    const grass = blockTypes.find("grass", "cube");
    for (let i = 0; i <= 2; ++i) {
      this.cluster().addBlock(new Block(grass, 0, i, 0, 0));
    }

    this.cluster().addBlock(new Block(grass, -1, 3, 0, 16)); // left

    this.cluster().addBlock(new Block(grass, 0, 4, 0, 12)); // head

    this.cluster().addBlock(new Block(grass, 1, 3, 0, 8)); // right
  }
}
