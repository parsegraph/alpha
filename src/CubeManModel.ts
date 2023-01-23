import BlockTypes from "./BlockTypes";
import { GLProvider } from "parsegraph-compileprogram";
import {
  Physical,
  BasicPhysical,
  alphaRandom,
  AlphaQuaternion,
  AlphaVector,
} from "parsegraph-physical";
import { BasicModel, SharedModel } from "./Model";
import Block from "./Block";
import Cluster from "./Cluster";

export default class CubeManModel extends BasicModel {
  constructor(
    glProvider: GLProvider,
    blockTypes: BlockTypes,
    parent?: Physical
  ) {
    super(glProvider, parent);

    const cubeman = blockTypes.find("blank", "cubeman");
    this.cluster().addBlock(new Block(cubeman, 0, 5, 0, 0));
  }
}
