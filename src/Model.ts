import Cluster from "./Cluster";
import { Physical, BasicPhysical } from "parsegraph-physical";
import { GLProvider } from "parsegraph-compileprogram";

export class SharedModel implements Model {
  _cluster: Cluster;
  _phys: BasicPhysical;
  _onTick: (elapsedMs: number) => boolean;

  constructor(cluster: Cluster, parent?: Physical) {
    this._phys = new BasicPhysical(parent);
    this._cluster = cluster;

    this._onTick = null;
  }

  setOnTick(cb: (elapsedMs: number) => boolean) {
    this._onTick = cb;
  }

  tick(elapsedMs: number) {
    return this._onTick ? this._onTick(elapsedMs) : false;
  }

  cluster() {
    return this._cluster;
  }

  physical() {
    return this._phys;
  }
}

export default interface Model {
  physical(): Physical;
  cluster(): Cluster;
  tick(elapsedMs: number): boolean;
}

export class BasicModel implements Model {
  _cluster: Cluster;
  _phys: BasicPhysical;

  constructor(glProvider: GLProvider, parent?: Physical) {
    this._phys = new BasicPhysical(parent);
    this._cluster = new Cluster(glProvider);
  }

  tick(_: number) {
    return false;
  }

  cluster() {
    return this._cluster;
  }

  physical() {
    return this._phys;
  }
}
