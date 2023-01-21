// Version 1.5

import { AlphaQuaternion } from "parsegraph-physical";

/*
			[Vector]    [Color]
			  |         |
			 [Face]     [Skin]
			  |         |
			 [Shape] ---BlockType
			            |
			            ID -- just a number in a table with the BlockType as its value
			            |
		[alpha_Block(id, x, y, z, orientation)]
			            |
		    [alpha_Cluster(blockTypes)]

some of the above classes are really basic
really nothing but tables
they exist to make it easier to piece things together
hopefully
*/

const s45 = Math.sin(Math.PI / 4); // Math.sqrt(2) / 2 or Math.sin(45)
const blockOrientations = [
  // BOTTOM
  // X( 0 )  Y( 0 )  Z( 0 )
  new AlphaQuaternion(0, 0, 0, 1), // 0
  // X( 0 )  Y( 90 )  Z( 0 )
  new AlphaQuaternion(0, s45, 0, s45), // 1
  // X( 0 )  Y( 180 )  Z( 0 )
  new AlphaQuaternion(0, 1, 0, 0), // 2
  // X( 0 )  Y( 270 )  Z( 0 )
  new AlphaQuaternion(0, s45, 0, -s45), // 3

  // FRONT
  // X( 90 )  Y( 0 )  Z( 0 )
  new AlphaQuaternion(-s45, 0, 0, -s45), // 4
  // X( 90 )  Y( 90 )  Z( 0 )
  new AlphaQuaternion(-0.5, -0.5, -0.5, -0.5), // 5
  // X( 90 )  Y( 180 )  Z( 0 )
  new AlphaQuaternion(0, -s45, -s45, 0), // 6
  // X( 90 )  Y( 270 )  Z( 0 )
  new AlphaQuaternion(0.5, -0.5, -0.5, 0.5), // 7

  // LEFT
  // X( 0 )  Y( 0 )  Z( 270 )
  new AlphaQuaternion(0, 0, -s45, s45), // 8
  // X( 0 )  Y( 90 )  Z( 270 )
  new AlphaQuaternion(0.5, 0.5, -0.5, 0.5), // 9
  // X( 0 )  Y( 180 )  Z( 270 )
  new AlphaQuaternion(s45, s45, 0, 0), // 10
  // X( 0 )  Y( 270 )  Z( 270 )
  new AlphaQuaternion(0.5, 0.5, 0.5, -0.5), // 11

  // BACK
  // X( 270 )  Y( 0 )  Z( 0 )
  new AlphaQuaternion(-s45, 0, 0, s45), // 12
  // X( 270 )  Y( 90 )  Z( 0 )
  new AlphaQuaternion(-0.5, 0.5, -0.5, 0.5), // 13
  // X( 270 )  Y( 180 )  Z( 0 )
  new AlphaQuaternion(0, s45, -s45, 0), // 14
  // X( 270 )  Y( 270 )  Z( 0 )
  new AlphaQuaternion(0.5, 0.5, -0.5, -0.5), // 15

  // RIGHT
  // X( 0 )  Y( 0 )  Z( 90 )
  new AlphaQuaternion(0, 0, -s45, -s45), // 16
  // X( 0 )  Y( 90 )  Z( 90 )
  new AlphaQuaternion(0.5, -0.5, -0.5, -0.5), // 17
  // X( 0 )  Y( 180 )  Z( 90 )
  new AlphaQuaternion(s45, -s45, 0, 0), // 18
  // X( 0 )  Y( 270 )  Z( 90 )
  new AlphaQuaternion(0.5, -0.5, 0.5, 0.5), // 19

  // TOP
  // X( 180 )  Y( 0 )  Z( 0 )
  new AlphaQuaternion(1, 0, 0, 0), // 20
  // X( 180 )  Y( 90 )  Z( 0 )
  new AlphaQuaternion(s45, 0, s45, 0), // 21
  // X( 180 )  Y( 180 )  Z( 0 )
  new AlphaQuaternion(0, 0, 1, 0), // 22
  // X( 180 )  Y( 270 )  Z( 0 )
  new AlphaQuaternion(-s45, 0, s45, 0), // 23
];

// --------------------------------------------
// --------------------------------------------
// --------------  Blocks ---------------------
// --------------------------------------------
// --------------------------------------------
export default class Block {
  orientation: number;
  pos: [number, number, number];
  id: any;

  constructor(
    id: any,
    x: number,
    y: number,
    z: number,
    orientation: number = 0
  ) {
    this.id = id || 0;
    this.pos = [x, y, z];
    this.orientation = orientation;

    if (this.orientation >= 24 || this.orientation < 0) {
      throw new Error(
        "Orientation cannot be out of bounds: " + this.orientation
      );
    }

    if (
      typeof this.pos[0] !== "number" ||
      typeof this.pos[1] !== "number" ||
      typeof this.pos[2] !== "number"
    ) {
      throw new Error("All block components must be numeric.");
    }
  }

  equals(other: Block) {
    const fuzziness = 1e-10;
    for (let i = 0; i < this.pos.length; ++i) {
      if (Math.abs(this.pos[i] - other.pos[i]) > fuzziness) {
        // Found a significant difference.
        return false;
      }
    }

    // Equal.
    return true;
  }

  GetAngleAxis() {
    return blockOrientations[this.orientation].toAxisAndAngle();
  }

  // naively calling this function results in a quaternion that you can
  // manipulate but not  destroy the Block.Orienations
  // passing something to actual lets you avoid the overhead of making a new
  // quaternion; and returns the same quaternion for the same rotation
  // for better comparing
  // in C these values would be const static
  getQuaternion(actual?: boolean) {
    if (actual) {
      return blockOrientations[this.orientation];
    }
    return new AlphaQuaternion(blockOrientations[this.orientation]);
  }
}
