// --------------------------------------------
// --------------------------------------------
// -------------- Cluster  --------------------
// --------------------------------------------
// --------------------------------------------

import { DrawType } from "./Face";
import { AlphaVector, AlphaRMatrix4 } from "parsegraph-physical";
import FacePainter from "./FacePainter";
import Block from "./Block";
import { GLProvider } from "parsegraph-compileprogram";
import BlockTypes from "./BlockTypes";

/**
 * Cluster is where the information from blocks, blocktype, color and face
 * actually gets put to use it figures out how to draw the blocks that have
 * been added to it so that they can be drawn inside of 1 Matrix Push/Pop it
 * would probably not be efficient to put a lot of moving objects inside of a
 * single cluster as the cluster would have to be continuously updating
 * everytime a block was edited
 */
export default class Cluster {
  _blocks: Block[];
  _facePainter: FacePainter;

  _needsRepaint: boolean;

  constructor(glProvider: GLProvider) {
    this._blocks = [];

    this._facePainter = new FacePainter(glProvider);
    this._needsRepaint = true;
  }

  hasBlock(block: Block) {
    for (let i = 0; i < this._blocks.length; ++i) {
      if (this._blocks[i] == block) {
        return i;
      }
    }
    return null;
  }

  invalidate() {
    this._needsRepaint = true;
  }

  addBlock(block: Block) {
    if (!this.hasBlock(block)) {
      this.invalidate();
      this._blocks.push(block);
    }
    return block;
  }

  RemoveBlock(block: Block) {
    const i = this.hasBlock(block);
    if (i != null) {
      this.invalidate();
      this._blocks.splice(i, 1)[0];
    }
  }

  /**
   * pass a table of blocks and it will add the ones that are new
   */
  AddBlocks() {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; ++i) {
        this.addBlock(arguments[i]);
      }
    } else {
      for (let i = 0; i < arguments[0].length; ++i) {
        this.addBlock(arguments[0][i]);
      }
    }
  }

  ClearBlocks() {
    this._blocks.splice(0, this._blocks.length);
    this.invalidate();
  }

  countVertices(blockTypes: BlockTypes) {
    return this._blocks.reduce((totalVerts, block) => {
      // get the faces from the blocktype
      const bType = blockTypes.get(block.id);
      if (!bType) {
        throw new Error("Failed to get block type for: " + block.id);
      }
      const shape = bType[0];
      const skin = bType[1];

      let numVerts = 0;
      for (let i = 0; i < shape.length(); ++i) {
        // vertices is face!
        const face = shape.get(i);
        if (!face) {
          throw new Error("Shape must not contain any null faces");
        }
        const colors = skin.get(i);
        if (!colors) {
          throw new Error("Shape must not contain any null colors");
        }

        // every face has its own drawType;
        if (face.drawType() == DrawType.TRIANGLES) {
          numVerts += face.length() * 3;
        } else if (face.drawType() == DrawType.QUADS) {
          numVerts += face.length() * 4;
        } else {
          throw new Error(
            "Face must have a valid drawType property to read of either alphaQUADS or alphaTRIANGLES. (Given " +
              face.drawType +
              ")"
          );
        }
      }
      return totalVerts + numVerts;
    }, 0);
  }

  calculateVertices(blockTypes: BlockTypes) {
    if (!this._needsRepaint) {
      return;
    }
    this._facePainter.initBuffer(this.countVertices(blockTypes));

    const rv1 = new AlphaVector();
    const rv2 = new AlphaVector();
    const rv3 = new AlphaVector();
    const rv4 = new AlphaVector();
    this._blocks.forEach((block) => {
      const quat = block.getQuaternion(true);
      if (!quat) {
        // console.log(block);
        throw new Error("Block must not return a null quaternion");
      }

      // get the faces from the blocktype
      const bType = blockTypes.get(block.id);
      if (!bType) {
        throw new Error("Failed to get block type for: " + block.id);
      }
      const shape = bType[0];
      const skin = bType[1];

      for (let i = 0; i < shape.length(); ++i) {
        // vertices is face!
        const face = shape.get(i);
        if (!face) {
          throw new Error("Shape must not contain any null faces");
        }
        const colors = skin.get(i);
        if (!colors) {
          throw new Error("Shape must not contain any null colors");
        }

        // every face has its own drawType;
        if (face.drawType() == DrawType.TRIANGLES) {
          // Process every vertex of the face.
          for (let j = 0; j < face.length(); j += 3) {
            let v1 = face.get(j);
            let v2 = face.get(j + 1);
            let v3 = face.get(j + 2);

            // get the color for this vertex;
            const c1 = colors[j];
            const c2 = colors[j + 1];
            const c3 = colors[j + 2];

            // rotate it; if it's not the default
            if (block.orientation > 0) {
              v1 = quat.rotatedVector(v1);
              v2 = quat.rotatedVector(v2);
              v3 = quat.rotatedVector(v3);
            }
            // now translate it
            v1 = v1.added(new AlphaVector(...block.pos));
            v2 = v2.added(new AlphaVector(...block.pos));
            v3 = v3.added(new AlphaVector(...block.pos));

            // vector and cluster use the same indexes
            this._facePainter.triangle(v1, v2, v3, c1, c2, c3);
          }
        } else if (face.drawType() == DrawType.QUADS) {
          // Process every vertex of the face.
          for (let j = 0; j < face.length(); j += 4) {
            const v1 = face.get(j);
            // if(!v1) {
            // throw new Error("Face must not contain any null vertices (v1)");
            // }
            const v2 = face.get(j + 1);
            // if(!v2) {
            // throw new Error("Face must not contain any null vertices (v2)");
            // }
            const v3 = face.get(j + 2);
            // if(!v3) {
            // throw new Error("Face must not contain any null vertices (v3)");
            // }
            const v4 = face.get(j + 3);
            // if(!v4) {
            // throw new Error("Face must not contain any null vertices (v4)");
            // }

            // get the color for this vertex;
            const c1 = colors[j];
            // if(!c1 ) {
            // throw new Error("Colors must not contain any null color values (c1)");
            // }
            const c2 = colors[j + 1];
            // if(!c2 ) {
            // throw new Error("Colors must not contain any null color values (c2)");
            // }
            const c3 = colors[j + 2];
            // if(!c3 ) {
            // throw new Error("Colors must not contain any null color values (c3)");
            // }
            const c4 = colors[j + 3];
            // if(!c4 ) {
            // throw new Error("Colors must not contain any null color values (c4)");
            // }

            // rotate it; if it's not the default
            if (block.orientation > 0) {
              quat.rotatedVectorEach(rv1, v1[0], v1[1], v1[2]);
              quat.rotatedVectorEach(rv2, v2[0], v2[1], v2[2]);
              quat.rotatedVectorEach(rv3, v3[0], v3[1], v3[2]);
              quat.rotatedVectorEach(rv4, v4[0], v4[1], v4[2]);
            } else {
              rv1.set(v1);
              rv2.set(v2);
              rv3.set(v3);
              rv4.set(v4);
            }
            // now translate it
            // if(typeof block[0] !== "number" || typeof block[1] !== "number" || typeof block[2] !== "number") {
            // console.log(block);
            // throw new Error("Block must contain numeric components.");
            // }
            rv1.add(...block.pos);
            rv2.add(...block.pos);
            rv3.add(...block.pos);
            rv4.add(...block.pos);

            // Translate quads to triangles
            this._facePainter.quad(rv1, rv2, rv3, rv4, c1, c2, c3, c4);
          }
        } else {
          throw new Error(
            "Face must have a valid drawType property to read of either alphaQUADS or alphaTRIANGLES. (Given " +
              face.drawType +
              ")"
          );
        }
      }
    });

    this._facePainter.commit();
    this._needsRepaint = false;
  }

  draw(viewMatrix: AlphaRMatrix4) {
    if (!this._facePainter) {
      return;
    }
    this._facePainter.draw(viewMatrix);
  }
}
