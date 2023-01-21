const assert = require("assert");
import TestSuite from "parsegraph-testsuite";
import { AlphaVector, AlphaQuaternion } from "parsegraph-physical";
import { AlphaBlockTypes } from "../src/BlockStuff";

describe("Alpha", function () {
  const AlphaBlockTypes_Tests = new TestSuite("AlphaBlockTypes");

  AlphaBlockTypes_Tests.addTest("AlphaBlockTypes", function () {
    const types = new AlphaBlockTypes();

    const white = new AlphaColor(1, 1, 1);
    const dbrown = new AlphaColor("#3b2921");
    const lbrown = new AlphaColor("#604b42");
    const ggreen = new AlphaColor("#0b9615");
    const gray = new AlphaColor("#5e5a5e");
    const lgray = new AlphaColor("#726f72");

    const stone = new AlphaSkin(
      [lgray, gray, lgray, gray], // top
      [lgray, gray, lgray, gray], // front
      [lgray, gray, lgray, gray], // left
      [lgray, gray, lgray, gray], // back
      [lgray, gray, lgray, gray], // right
      [lgray, gray, lgray, gray], // bottom
      [lgray, gray, lgray, gray], // misc
      [lgray, gray, lgray, gray], // misc
      [lgray, gray, lgray, gray], // misc
      [lgray, gray, lgray, gray] // misc
    );

    // vertices!
    const cubeStructure = [
      new AlphaVector(-0.5, 0.5, 0.5), // 1
      new AlphaVector(0.5, 0.5, 0.5), // 2
      new AlphaVector(0.5, 0.5, -0.5), // 3
      new AlphaVector(-0.5, 0.5, -0.5), // 4
      new AlphaVector(0.5, -0.5, 0.5), // 5
      new AlphaVector(-0.5, -0.5, 0.5), // 6
      new AlphaVector(-0.5, -0.5, -0.5), // 7
      new AlphaVector(0.5, -0.5, -0.5), // 8
    ];
    const v = cubeStructure;

    // cube faces;
    const Top = new AlphaFace(v[2], v[3], v[0], v[1]);
    const Front = new AlphaFace(v[3], v[2], v[7], v[6]);
    const Left = new AlphaFace(v[0], v[3], v[6], v[5]);
    const Back = new AlphaFace(v[1], v[0], v[5], v[4]);
    const Right = new AlphaFace(v[2], v[1], v[4], v[7]);
    const Bottom = new AlphaFace(v[6], v[7], v[4], v[5]);

    // turn the faces into shapes

    // top to bottom
    // counter-clockwise
    // front to back
    const CUBE = new AlphaShape(Top, Front, Left, Back, Right, Bottom);

    types.create("stone", "cube", stone, CUBE);
    if (types.get("stone", "cube") != types.get("stone", "cube")) {
      return "Types do not match.";
    }
  });

  it("works", () => {
    assert(AlphaBlockTypes_Tests.run().isSuccessful());
  });
});
