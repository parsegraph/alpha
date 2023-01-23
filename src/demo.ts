import TimingBelt from "parsegraph-timingbelt";
import { Projector, BasicProjector } from "parsegraph-projector";
import AlphaGLWidget from "./GLWidget";
import SphereModel from "./SphereModel";
import SwarmModel from "./SwarmModel";
import {
  Physical,
  BasicPhysical,
  alphaRandom,
  AlphaQuaternion,
  AlphaVector,
} from "parsegraph-physical";
import { BasicModel, SharedModel } from "./Model";
import BlockTypes from "./BlockTypes";
import { standardBlockTypes } from "./standardBlockTypes";
import CubeMan from "./CubeMan";
import Cluster from "./Cluster";
import CubeManModel from "./CubeManModel";
import WorldModel from "./WorldModel";
import PlatformModel from "./PlatformModel";
import PlayerModel from "./PlayerModel";

const createSwarm = (
  widget: AlphaGLWidget,
  cluster: Cluster,
  spot: AlphaVector,
  parent?: Physical,
  numSwarm: number = 10
) => {
  let time = 0;

  for (let i = 0; i < numSwarm; ++i) {
    const model = new SharedModel(cluster, parent);
    let x = alphaRandom(1, 30);
    let y = alphaRandom(1, 30);
    let z = alphaRandom(1, 30);
    model.physical().setPosition(spot.added(x, y, z));

    x = alphaRandom(-100, 100) / 100;
    y = alphaRandom(-100, 100) / 100;
    z = alphaRandom(-100, 100) / 100;
    const w = alphaRandom(-100, 100) / 100;
    const q = new AlphaQuaternion(x, y, z, w);
    q.normalize();
    model.physical().setOrientation(q);

    model.setOnTick((elapsedMs) => {
      time += elapsedMs;

      const v = model.physical();
      if (time < 6) {
        v.moveForward(elapsedMs);
        v.yawRight((2 * Math.PI) / 180);
      } else {
        v.pitchDown((1 * Math.PI) / 180);
        v.yawRight((2 * Math.PI) / 180);
        v.changePosition(0, -0.2, 0);
      }

      return false;
    });
    widget.addToScene(model);
  }
};

const makeDemoWidget = (proj: Projector) => {
  const glProvider = proj.glProvider();

  const blockTypes = new BlockTypes();
  standardBlockTypes(blockTypes);
  CubeMan(blockTypes);

  const widget = new AlphaGLWidget(proj, blockTypes);
  const cam = widget.camera;

  const world = new WorldModel(glProvider, blockTypes, cam, 50);
  widget.addToScene(world);
  const sphere = new SphereModel(
    proj.glProvider(),
    widget.blockTypes,
    widget.camera
  );
  sphere.physical().setPosition(145, 0, 0);
  widget.addToScene(sphere);

  const cubeMan = new CubeManModel(
    proj.glProvider(),
    widget.blockTypes,
    widget.camera
  );
  const playerB = new SharedModel(cubeMan.cluster(), cam);
  playerB.physical().setPosition(0, 0, -3);
  cam.setParent(playerB.physical());
  widget.addToScene(playerB);

  createSwarm(
    widget,
    cubeMan.cluster(),
    new AlphaVector(0, 15, 35),
    widget.camera,
    10
  );
  const swarm = new SwarmModel(proj.glProvider(), widget.camera);
  widget.addToScene(swarm);

  const offsetPlatformPhysical = new BasicPhysical(cam);
  offsetPlatformPhysical.setParent(cam);
  offsetPlatformPhysical.setPosition(0, 0, -25);
  offsetPlatformPhysical.yawLeft(0);
  offsetPlatformPhysical.rollRight(0);

  widget.addTick((elapsedMs: number) => {
    offsetPlatformPhysical.moveLeft(elapsedMs);
    offsetPlatformPhysical.yawLeft((0.1 * Math.PI) / 180);
    return false;
  });

  const playerA = new PlayerModel(
    glProvider,
    blockTypes,
    offsetPlatformPhysical
  );
  playerA.physical().setPosition(2, 1, 0);
  playerA.physical().turnLeft(Math.PI / 2);
  widget.addToScene(playerA);

  const platform = new PlatformModel(
    glProvider,
    blockTypes,
    offsetPlatformPhysical
  );
  widget.addToScene(platform);

  return widget;
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";
  const proj = new BasicProjector();
  root.appendChild(proj.container());

  const belt = new TimingBelt();
  belt.setAutorender(true);
  const widget = makeDemoWidget(proj);
  widget.setOnScheduleUpdate(() => {
    belt.scheduleUpdate();
  });
  belt.addRenderable(widget);
});
