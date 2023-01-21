// --------------------------------------------
// --------------------------------------------
// -------------- Cluster  --------------------
// --------------------------------------------
// --------------------------------------------

import { alphaQUADS, alphaTRIANGLES, createBlock } from "./BlockStuff";
import { AlphaVector } from "./Maths";
import FacePainter from "./FacePainter";

/**
 * Cluster is where the information from blocks, blocktype, color and face
 * actually gets put to use it figures out how to draw the blocks that have
 * been added to it so that they can be drawn inside of 1 Matrix Push/Pop it
 * would probably not be efficient to put a lot of moving objects inside of a
 * single cluster as the cluster would have to be continuously updating
 * everytime a block was edited
 */
export default class AlphaCluster {
  constructor(widget) {
    if (!widget) {
      throw new Error("Cluster must be given a non-null alpha_GLWidget");
    }
    this.widget = widget;

    this.blocks = [];

    // Declare GL Painters; create them only when needed to delay GL context's creation.
    this.facePainter = null;
  }

  hasBlock(block) {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i] == block) {
        return i;
      }
    }
    return null;
  }

  addBlock(...args) {
    if (arguments.length > 1) {
      // Create a new block.
      this.blocks.push(createBlock(...args));
      return;
    }
    const block = args[0];
    if (!this.hasBlock(block)) {
      this.blocks.push(block);
    }
    return block;
  }

  RemoveBlock(block) {
    const i = this.hasBlock(block);
    if (i != null) {
      return this.blocks.splice(i, 1)[0];
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
    this.blocks.splice(0, this.blocks.length);
  }

  calculateVertices() {
    if (!this.facePainter) {
      this.facePainter = new FacePainter(this.widget.gl());
    } else {
      // delete what we had;
      this.facePainter.clear();
    }

    const rv1 = new AlphaVector();
    const rv2 = new AlphaVector();
    const rv3 = new AlphaVector();
    const rv4 = new AlphaVector();
    this.blocks.forEach(function (block) {
      const quat = block.getQuaternion(true);
      if (!quat) {
        // console.log(block);
        throw new Error("Block must not return a null quaternion");
      }

      // get the faces from the blocktype
      const bType = this.widget.BlockTypes.get(block.id);
      if (!bType) {
        return;
      }
      const shape = bType[0];
      const skin = bType[1];

      for (let i = 0; i < shape.length; ++i) {
        // vertices is face!
        const face = shape[i];
        if (!face) {
          throw new Error("Shape must not contain any null faces");
        }
        const colors = skin[i];
        if (!colors) {
          throw new Error("Shape must not contain any null colors");
        }

        // every face has its own drawType;
        if (face.drawType == alphaTRIANGLES) {
          // Process every vertex of the face.
          for (let j = 0; j < face.length; ++j) {
            let vertex = face[j];
            if (!vertex) {
              throw new Error("Face must not contain any null vertices");
            }
            // get the color for this vertex;
            const color = colors[j];
            if (!color) {
              throw new Error("Colors must not contain any null color values");
            }

            // rotate it; if it's not the default
            if (block.orientation > 0) {
              vertex = quat.rotatedVector(vertex);
            }
            // now translate it
            vertex = vertex.dded(new AlphaVector(block[0], block[1], block[2]));

            // vector and cluster use the same indexes
            this.facePainter.triangle(
              vertex[0],
              vertex[1],
              vertex[2],
              color[0],
              color[1],
              color[2]
            );
          }
        } else if (face.drawType == alphaQUADS) {
          // Process every vertex of the face.
          for (let j = 0; j < face.length; j += 4) {
            const v1 = face[j];
            // if(!v1) {
            // throw new Error("Face must not contain any null vertices (v1)");
            // }
            const v2 = face[j + 1];
            // if(!v2) {
            // throw new Error("Face must not contain any null vertices (v2)");
            // }
            const v3 = face[j + 2];
            // if(!v3) {
            // throw new Error("Face must not contain any null vertices (v3)");
            // }
            const v4 = face[j + 3];
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
            rv1.add(block[0], block[1], block[2]);
            rv2.add(block[0], block[1], block[2]);
            rv3.add(block[0], block[1], block[2]);
            rv4.add(block[0], block[1], block[2]);

            // Translate quads to triangles
            this.facePainter.quad(rv1, rv2, rv3, rv4, c1, c2, c3, c4);
          }
        } else {
          throw new Error(
            "Face must have a valid drawType property to read of either alphaQUADS or alphaTRIANGLES. (Given " +
              face.drawType +
              ")"
          );
        }
      }
    }, this);
  }

  draw(viewMatrix) {
    if (!this.facePainter) {
      return;
    }
    this.facePainter.draw(viewMatrix);
  }
}

/*
const TestSuite = require('parsegraph-testsuite').default;
alpha_Cluster_Tests = new TestSuite('alpha_Cluster');

alpha_Cluster_Tests.addTest('alpha_Cluster', function(resultDom) {
  const belt = new parsegraph_TimingBelt();
  const window = new parsegraph_Window();
  const widget = new alpha_GLWidget(belt, window);

  // test version 1.0
  const Cubeman = widget.BlockTypes.get('blank', 'Cubeman');

  const testCluster = new alpha_Cluster(widget);
  testCluster.addBlock(Cubeman, 0, 5, 0, 1);
  testCluster.calculateVertices();
});
*/
