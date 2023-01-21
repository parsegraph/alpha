import Skin from "./Skin";
import Shape from "./Shape";

// --------------------------------------------
// --------------------------------------------
// ----------- BlockTypes  --------------------
// --------------------------------------------
// --------------------------------------------
// Blocktype is where you combine a Shape(pos vec) with A Skin(color vec)
// let stone = new alpha_BlockType("stone", "cube", Stone, graySkin)
// BlockType automatically loads created BlockTypes into the BlockIDs table
// it is some sort of hybrid object / masterlist
export default class BlockTypes {
  blockIDs: [Shape, Skin][];
  descriptions: { [descSkin: string]: { [descShape: string]: number } };

  constructor() {
    this.blockIDs = [];
    this.descriptions = {};
  }

  load(descSkin: string, descShape: string, skin: Skin, shape: Shape) {
    return this.create(descSkin, descShape, skin, shape);
  }

  /**
   * creates a blocktype and returns the id.
   */
  create(descSkin: string, descShape: string, skin: Skin, shape: Shape) {
    for (let i = 0; i < shape.length(); ++i) {
      const face = shape.get(i);
      for (let j = 0; j < face.length(); ++j) {
        if (!skin.get(i) || !skin.get(i)[j]) {
          throw new Error("Skin is too damn small");
          // however I will let you wear it if its a little large!
        }
      }
    }
    if (!this.descriptions[descSkin]) {
      // these descriptions aren't already in use
      this.descriptions[descSkin] = {};
    } else if (this.descriptions[descSkin][descShape]) {
      throw new Error(
        "This Shape and Skin description combo is already in use"
      );
    }

    const blockType: [Shape, Skin] = [shape, skin];
    this.blockIDs.push(blockType);
    this.descriptions[descSkin][descShape] = this.blockIDs.length - 1;
    return this.descriptions[descSkin][descShape];
  }

  get(id: number) {
    return this.blockIDs[id];
  }

  find(descSkin: string, descShape: string) {
    if (!this.descriptions[descSkin]) {
      console.log(this.descriptions);
      throw new Error(
        "No such skin description exists for '" + (descSkin || "") + "'"
      );
    } else if (!this.descriptions[descSkin][descShape]) {
      throw new Error(
        "No such shape description exists for '" + (descShape || "") + "'"
      );
    }
    return this.blockIDs[this.descriptions[descSkin][descShape]];
  }
}
