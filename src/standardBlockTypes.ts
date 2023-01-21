// Version 1.3

import BlockTypes from "./BlockTypes";

import Face, { DrawType } from "./Face";
import Color from "./Color";
import Skin from "./Skin";
import Shape from "./Shape";
import { AlphaVector } from "parsegraph-physical";

// vertices!
export function buildCubeStructure() {
  return [
    new AlphaVector(-0.5, 0.5, 0.5), // 0
    new AlphaVector(0.5, 0.5, 0.5), // 1
    new AlphaVector(0.5, 0.5, -0.5), // 2
    new AlphaVector(-0.5, 0.5, -0.5), // 3
    new AlphaVector(0.5, -0.5, 0.5), // 4
    new AlphaVector(-0.5, -0.5, 0.5), // 5
    new AlphaVector(-0.5, -0.5, -0.5), // 6
    new AlphaVector(0.5, -0.5, -0.5), // 7
  ];
}

export function buildSlabStructure() {
  const slabStructure = buildCubeStructure();
  for (let i = 0; i <= 3; ++i) {
    slabStructure[i].add(0, -0.5, 0);
  }
  return slabStructure;
}

export function standardBlockTypes(blockTypes: BlockTypes) {
  if (!blockTypes) {
    throw new Error("blockTypes must not be null");
  }

  // skins
  // const white = new Color(1, 1, 1);
  const dbrown = Color.fromHex("#3b2921");
  const lbrown = Color.fromHex("#604b42");
  const ggreen = Color.fromHex("#0b9615");
  const gray = Color.fromHex("#5e5a5e");
  const lgray = Color.fromHex("#726f72");

  // top to bottom
  // counter-clockwise
  // front to back
  const dirt = new Skin(
    [lbrown, lbrown, lbrown, lbrown], // top
    [lbrown, lbrown, dbrown, dbrown], // front
    [lbrown, lbrown, dbrown, dbrown], // left
    [lbrown, lbrown, dbrown, dbrown], // back
    [lbrown, lbrown, dbrown, dbrown], // right
    [dbrown, dbrown, dbrown, dbrown] // bottom
  );

  const grass = new Skin(
    [ggreen, ggreen, ggreen, ggreen], // top
    [lbrown, lbrown, dbrown, dbrown], // front
    [lbrown, lbrown, dbrown, dbrown], // left
    [lbrown, lbrown, dbrown, dbrown], // back
    [lbrown, lbrown, dbrown, dbrown], // right
    [dbrown, dbrown, dbrown, dbrown] // bottom
  );

  const stone = new Skin(
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

  // draw everthing in a face:
  // top to bottom
  // counter-clockwise ( facing the face )
  // front to back

  // with that priority;

  //        v4___________ v3
  //        |\ FRONT   |\   TOP
  //        | \v1______|_\  v2
  // LEFT   |__|_______|  |
  //        \v7|     v8\  | RIGHT
  //         \ | BOTTOM \ |
  //          \|_________\| v5
  //          v6  BACK

  // the relative directions are pretty messy

  // right now our cubes are centered on their position
  // later we may offset them so a cubes vertices are always an int;
  // of course that means for each rotation we will have to translate by .5
  // rotate, then translate back

  // cube faces;
  let v = buildCubeStructure();
  let Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  let Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  let Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  let Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  let Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  let Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  // turn the faces into shapes

  // top to bottom
  // counter-clockwise
  // front to back
  const CUBE = new Shape(Top, Front, Left, Back, Right, Bottom);

  blockTypes.create("stone", "cube", stone, CUBE);
  blockTypes.create("dirt", "cube", dirt, CUBE);
  blockTypes.create("grass", "cube", grass, CUBE);

  // a slope lowers vertices 1 and 2 to 6 and 5;
  let slopeStructure = buildCubeStructure();
  v = slopeStructure;
  for (let i = 0; i <= 1; ++i) {
    v[i].add(0, -1, 0);
  }

  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[1], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SLOPE = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "slope", stone, SLOPE);

  // there are 4 simple sloped corners for a fullsized cube;
  // split the top face into two triangles
  // with the triangle split top vs slant
  // ( better names to come in time)
  // a beveled corner  (1 top, 3 bottom -- actually 2 )
  // an inverted beveled corner ( 3 top, 1 bottom )

  // with the top split along the path downwards
  // a pyramid corner (1 top, 3 bottom)
  // an inverted pyramid corner ( 3 top, 1 bottom )

  // the beveled corner slope
  // lower 1, 2, and 3 to the bottom;
  let bcslopeStructure = buildCubeStructure();
  v = bcslopeStructure;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -1, 0);
  }

  // now top, right
  Top = new Face(DrawType.TRIANGLES, v[3], v[0], v[2]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Bottom = new Face(DrawType.TRIANGLES, v[6], v[7], v[5]);

  const CORNER_SLOPE = new Shape(Top, Front, Left, Bottom);
  blockTypes.load("stone", "corner_slope", stone, CORNER_SLOPE);

  let ibcslopeStructure = buildCubeStructure();
  v = ibcslopeStructure;
  // 3 top, 1 bottom;
  v[1].add(0, -1, 0);

  Top = new Face(DrawType.TRIANGLES, v[2], v[3], v[0]);
  let Slope = new Face(DrawType.TRIANGLES, v[2], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const INVERTED_CORNER_SLOPE = new Shape(
    Top,
    Slope,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "inverted_corner_slope",
    stone,
    INVERTED_CORNER_SLOPE
  );

  // pyramid corner ( 1 top, 3 bottom )
  let pcorner = buildCubeStructure();
  v = pcorner;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -1, 0);
  }

  // now top, right
  let TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  let TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);
  const PYRAMID_CORNER = new Shape(TopLeft, TopRight, Front, Left, Bottom);
  blockTypes.load("stone", "pyramid_corner", stone, PYRAMID_CORNER);

  // inverted pyramid corner ( 3 top, 1 bottom )
  let ipcorner = buildCubeStructure();
  v = ipcorner;
  v[1].add(0, -1, 0);

  // now top, right
  TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const INVERTED_PYRAMID_CORNER = new Shape(
    TopLeft,
    TopRight,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "inverted_pyramid_corner",
    stone,
    INVERTED_PYRAMID_CORNER
  );

  v = buildSlabStructure();
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);
  const SLAB = new Shape(Top, Front, Left, Back, Right, Bottom);

  blockTypes.load("stone", "slab", stone, SLAB);

  // a slope lowers vertices 1 and 2 to 6 and 5;
  slopeStructure = buildCubeStructure();
  v = slopeStructure;
  for (let i = 0; i <= 1; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[1], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SLAB_SLOPE = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "slab_slope", stone, SLAB_SLOPE);

  bcslopeStructure = buildCubeStructure();
  v = bcslopeStructure;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // now top, right
  Top = new Face(DrawType.TRIANGLES, v[3], v[0], v[2]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Bottom = new Face(DrawType.TRIANGLES, v[6], v[7], v[5]);

  const SLAB_CORNER = new Shape(Top, Front, Left, Bottom);
  blockTypes.load("stone", "slab_corner", stone, SLAB_CORNER);

  ibcslopeStructure = buildCubeStructure();
  v = ibcslopeStructure;
  // 3 top, 1 bottom;
  v[1].add(0, -0.5, 0);
  Top = new Face(DrawType.TRIANGLES, v[2], v[3], v[0]);
  Slope = new Face(DrawType.TRIANGLES, v[2], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SLAB_INVERTED_CORNER = new Shape(
    Top,
    Slope,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load("stone", "slab_inverted_corner", stone, SLAB_INVERTED_CORNER);

  // pyramid corner ( 1 top, 3 bottom )
  pcorner = buildCubeStructure();
  v = pcorner;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // now top, right
  TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.TRIANGLES, v[3], v[6], v[5]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);
  const SLAB_PYRAMID_CORNER = new Shape(TopLeft, TopRight, Front, Left, Bottom);
  blockTypes.load("stone", "slab_pyramid_corner", stone, SLAB_PYRAMID_CORNER);

  // inverted pyramid corner ( 3 top, 1 bottom )
  ipcorner = buildSlabStructure();
  v = ipcorner;
  v[2].add(0, -0.5, 0);
  // now top, right
  TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SLAB_INVERTED_PYRAMID_CORNER = new Shape(
    TopLeft,
    TopRight,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "slab_inverted_pyramid_corner",
    stone,
    SLAB_INVERTED_PYRAMID_CORNER
  );

  // a slope lowers vertices 1 and 2 to 6 and 5;
  v = buildCubeStructure();
  for (let i = 0; i <= 1; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SHALLOW_SLOPE = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "shallow_slope", stone, SHALLOW_SLOPE);

  // there are 4 simple sloped corners for a fullsized cube;
  // split the top face into two triangles
  // with the triangle split top vs slant
  // ( better names to come in time)
  // a beveled corner  (1 top, 3 bottom -- actually 2 )
  // an inverted beveled corner ( 3 top, 1 bottom )

  // with the top split along the path downwards
  // a pyramid corner (1 top, 3 bottom)
  // an inverted pyramid corner ( 3 top, 1 bottom )

  // the beveled corner slope
  // lower 1, 2, and 3 to the bottom;
  bcslopeStructure = buildCubeStructure();
  v = bcslopeStructure;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // now top, right
  Top = new Face(DrawType.TRIANGLES, v[2], v[3], v[0]);
  Slope = new Face(DrawType.TRIANGLES, v[2], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[2], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SHALLOW_CORNER = new Shape(
    Top,
    Slope,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load("stone", "shallow_corner", stone, SHALLOW_CORNER);

  v = buildCubeStructure();
  // 3 top, 1 bottom;
  v[2].add(0, -0.5, 0);
  Top = new Face(DrawType.TRIANGLES, v[2], v[3], v[0]);
  Slope = new Face(DrawType.TRIANGLES, v[2], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SHALLOW_INVERTED_CORNER = new Shape(
    Top,
    Slope,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "shallow_inverted_corner",
    stone,
    SHALLOW_INVERTED_CORNER
  );

  // pyramid corner ( 1 top, 3 bottom )
  pcorner = buildCubeStructure();
  v = pcorner;
  for (let i = 0; i <= 2; ++i) {
    v[i].add(0, -0.5, 0);
  }
  // now top, right
  TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);
  const SHALLOW_PYRAMID_CORNER = new Shape(
    TopLeft,
    TopRight,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "shallow_pyramid_corner",
    stone,
    SHALLOW_PYRAMID_CORNER
  );

  // inverted pyramid corner ( 3 top, 1 bottom )
  ipcorner = buildCubeStructure();
  v = ipcorner;
  v[1].add(0, -0.5, 0);
  // now top, right
  TopLeft = new Face(DrawType.TRIANGLES, v[3], v[0], v[1]);
  TopRight = new Face(DrawType.TRIANGLES, v[2], v[3], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const SHALLOW_INVERTED_PYRAMID_CORNER = new Shape(
    TopLeft,
    TopRight,
    Front,
    Left,
    Back,
    Right,
    Bottom
  );
  blockTypes.load(
    "stone",
    "shallow_inverted_pyramid_corner",
    stone,
    SHALLOW_INVERTED_PYRAMID_CORNER
  );

  // an angled slab is a half slab cut in a right triangle
  v = buildSlabStructure();
  v[1].add(0, 0, -1);
  v[4].add(0, 0, -1);
  Top = new Face(DrawType.TRIANGLES, v[2], v[3], v[0]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Bottom = new Face(DrawType.TRIANGLES, v[6], v[7], v[5]);
  const ANGLED_SLAB = new Shape(Top, Front, Left, Back, Bottom);

  blockTypes.load("stone", "angled_slab", stone, ANGLED_SLAB);

  // half-slab
  v = buildSlabStructure();
  v[0].add(0, 0, -0.5);
  v[1].add(0, 0, -0.5);
  v[4].add(0, 0, -0.5);
  v[5].add(0, 0, -0.5);

  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.QUADS, v[1], v[0], v[5], v[4]);
  Right = new Face(DrawType.QUADS, v[2], v[1], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);
  const HALF_SLAB = new Shape(Top, Front, Left, Back, Right, Bottom);

  blockTypes.load("stone", "half_slab", stone, HALF_SLAB);

  // stairs
  const stairStructure = [
    new AlphaVector(-0.5, 0.5, 0), // 0 -- top
    new AlphaVector(0.5, 0.5, 0), // 1 -- top
    new AlphaVector(0.5, 0.5, -0.5), // 2 -- top
    new AlphaVector(-0.5, 0.5, -0.5), // 3 -- top
    new AlphaVector(0.5, -0.5, 0.5), // 4 -- bottom
    new AlphaVector(-0.5, -0.5, 0.5), // 5 -- bottom
    new AlphaVector(-0.5, -0.5, -0.5), // 6 -- bottom
    new AlphaVector(0.5, -0.5, -0.5), // 7 -- bottom
    new AlphaVector(-0.5, 0, 0), // 8 -- mid
    new AlphaVector(0.5, 0, 0), // 9 -- mid
    new AlphaVector(-0.5, 0, 0.5), // 10 -- mid
    new AlphaVector(0.5, 0, 0.5), // 11 -- mid
  ];
  v = stairStructure;
  const Flight1Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  const Flight1Front = new Face(DrawType.QUADS, v[1], v[0], v[8], v[9]);
  const Flight2Top = new Face(DrawType.QUADS, v[9], v[8], v[10], v[11]);
  const Flight2Front = new Face(DrawType.QUADS, v[11], v[10], v[5], v[4]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  const LeftTop = new Face(DrawType.QUADS, v[0], v[3], v[6], v[8]);
  const LeftBot = new Face(DrawType.QUADS, v[8], v[6], v[5], v[10]);

  const RightTop = new Face(DrawType.QUADS, v[2], v[1], v[9], v[7]);
  const RightBot = new Face(DrawType.QUADS, v[9], v[11], v[4], v[7]);

  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const STAIRS = new Shape(
    Flight1Top,
    Flight1Front,
    Flight2Top,
    Flight2Front,
    Front,
    LeftTop,
    LeftBot,

    RightTop,
    RightBot,
    Bottom
  );

  blockTypes.load("stone", "stairs", stone, STAIRS);

  // medium corner; lowers 1 and 3 to mid range
  // and 2 to bottom
  v = buildCubeStructure();
  v[0].add(0, -0.5, 0);
  v[2].add(0, -0.5, 0);
  v[1].add(0, -1, 0);
  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const MED_CORNER = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "med_corner", stone, MED_CORNER);

  // medium corner; lowers 1 to midrange
  // and 2 to bottom
  v = buildCubeStructure();
  v[0].add(0, -0.5, 0);
  v[1].add(0, -1, 0);
  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const MED_CORNER2 = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "med_corner2", stone, MED_CORNER2);

  // medium corner; lowers 1 and 3 to mid range
  // and 2 to bottom
  v = buildCubeStructure();
  v[2].add(0, -0.5, 0);
  v[1].add(0, -1, 0);
  // this causes left and right to become triangles
  Top = new Face(DrawType.QUADS, v[2], v[3], v[0], v[1]);
  Front = new Face(DrawType.QUADS, v[3], v[2], v[7], v[6]);
  Left = new Face(DrawType.QUADS, v[0], v[3], v[6], v[5]);
  Back = new Face(DrawType.TRIANGLES, v[0], v[5], v[4]);
  Right = new Face(DrawType.TRIANGLES, v[2], v[4], v[7]);
  Bottom = new Face(DrawType.QUADS, v[6], v[7], v[4], v[5]);

  const MED_CORNER3 = new Shape(Top, Front, Left, Back, Right, Bottom);
  blockTypes.load("stone", "med_corner3", stone, MED_CORNER3);
}
