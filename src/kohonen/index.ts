import Euclidean from '../formulas/euclidean';
import Denormalize from '../formulas/denormalize';
import Normalize from '../formulas/normalize';
import { InputDataExpected, UnexpectedWorkFlow, InvalidInputData } from '../exceptions';
import Clone from '../helpers/clone';
import { get, set } from 'lodash';
import MinMax from '../formulas/min-max';
import * as math from 'mathjs';

export enum KohonenType {
  SELF_ORGANIZE = 1,
  SELF_STUDY = 2,
}

export class Kohonen<T extends object> {
  public type: KohonenType;
  private _data: T[] = [];
  private _minMax: { [P in keyof T]: T[P] & { min: number, max: number } }
  private _normalized: T[] = [];
  private _clusters: T[] = [];

  private _speed: number = 0.5;
  private _delta: number = -0.05;
  private _iterations: number;

  public get speed() {
    return this._speed;
  }
  public set speed(value) {
    this._speed = value;
  }

  public get delta() {
    return this._delta;
  }
  public set delta(value) {
    this._delta = value;
  }

  public get iterations() {
    return this._iterations;
  }
  public set iterations(value) {
    this._iterations = value;
  }

  public get data() {
    return this._data;
  }

  public get clusters() {
    return this._clusters;
  }

  private denormalizeHelper: Denormalize;
  private normalizeHelper: Normalize;
  private euclideanHelper: Euclidean;
  private cloneHelper: Clone;
  private minMaxHelper: MinMax;

  constructor() {
    this.denormalizeHelper = new Denormalize();
    this.normalizeHelper = new Normalize();
    this.euclideanHelper = new Euclidean();
    this.cloneHelper = new Clone();
    this.minMaxHelper = new MinMax();
  }

  public setData(value: T[]) {
    if (!(value instanceof Array)) {
      throw new InvalidInputData('argument `value` should be instance of Array');
    } else if (!value.length) {
      throw new InvalidInputData('argument `value` should has at least one element')
    }
    this._data = this.cloneHelper.deepClone(value);
    this._minMax = this.minMaxHelper.getMinMaxConfig<T>(this.data);
    this._normalized = this._data.map(item => this.normalizeHelper.normalizeObject<T>(item, this._minMax));
  }

  public learn(range): T[] {
    do {
      this.buildClusters(range);
      this.speed = math.chain(this.speed).add(this.delta).done();
      if (this.iterations) {
        this.iterations--;
      }
    } while (this.speed > 0 && (this.iterations || this.iterations > 0))
    return this._clusters;
  }

  public clusterify(item: T) {
    if (!this.clusters.length) {
      throw new UnexpectedWorkFlow('Clusters are not prepared yet');
    }
    const normalized = this.normalizeHelper.normalizeObject(item, this._minMax);
    return this.getClosestCluster(normalized);
  }

  public setClusterStructure(structure: T[]): T[] {
    if (!this._minMax) {
      throw new UnexpectedWorkFlow('First of all you should fill `data` field');
    }
    this._clusters = structure.map(cluster => this.normalizeHelper.normalizeObject(cluster, this._minMax));
    return this._clusters;
  }

  public getDenormalizedClusters() {
    return this._clusters.map(cluster => this.denormalizeHelper.denormalizeObject(cluster, this._minMax));
  }

  private buildClusters(range: number): T[] {
    if (!this._normalized.length) {
      throw new InputDataExpected('First of all you should fill `data` field')
    }
    this._normalized.forEach((item, index) => {
      const closestCluster = this.getClosestCluster(item, range);
      if (closestCluster) {
        this.recalculateCluster(closestCluster, item);
      } else {
        this._clusters.push(item);
      }
    });
    return this._clusters;
  }

  /**
   * Returning closest cluster or null if there are no clusters or all clusters has distance bigger than `range`
   * @param item - point for which the cluster is searching
   * @param range - max distance to cluster
   */
  private getClosestCluster(item, range?: number): T {
    let closestDistance: number;
    return this._clusters.reduce((closest, candidate) => {
      const candidateDistance = this.euclideanHelper.getEuclideanDistance(candidate as any, item);
      if (
        (!closest && (!range || candidateDistance <= range))
        || (
          closest
          && closestDistance > candidateDistance
          && (!range || candidateDistance <= range)
        )
      ) {
        closestDistance = candidateDistance;
        return candidate;
      }
      return closest;
    }, null);
  }

  private recalculateCluster(cluster, item) {
    Object.keys(cluster).forEach(key => {
      const clusterPropValue = get(cluster, key) as number
      const recalculated = math
        .chain(clusterPropValue)
        .add(
          math
            .chain(get(item, key))
            .subtract(clusterPropValue)
            .multiply(this.speed)
            .done()
        )
        .done();
      set(cluster, key, recalculated);
    });
    return cluster;
  }
}
