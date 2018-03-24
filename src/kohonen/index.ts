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

  /** Configures how fast neural network will learn. value should be less or equal to 1 and bigger than 0 */
  public get speed() {
    return this._speed;
  }
  /** Configures how fast neural network will learn. value should be less or equal to 1 and bigger than 0 */
  public set speed(value) {
    this._speed = value;
  }

  /** Configures how much will decrease in the next iteration. value should be less than 0 */
  public get delta() {
    return this._delta;
  }
  /** Configures how much will decrease in the next iteration. value should be less than 0 */
  public set delta(value) {
    this._delta = value;
  }

  /** Configures how many iterations will be when learning will be started */
  public get iterations() {
    return this._iterations;
  }
  /** Configures how many iterations will be when learning will be started */
  public set iterations(value) {
    this._iterations = value;
  }

  /** Returns data which was set on `setData` call. */
  public get data() {
    return this._data;
  }

  /** Returns prepared clusters (normalized). */
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

  /** Sets data which will be clusterized */
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

  /** Preparing clusters */
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

  /** Returns closest cluster to specified item */
  public clusterify(item: T) {
    if (!this.clusters.length) {
      throw new UnexpectedWorkFlow('Clusters are not prepared yet');
    }
    const normalized = this.normalizeHelper.normalizeObject(item, this._minMax);
    return this.getClosestCluster(normalized);
  }

  /** Sets clusters (input data should not be denormalized, this operation will be done automatically) */
  public setClusterStructure(structure: T[]): T[] {
    if (!this._minMax) {
      throw new UnexpectedWorkFlow('First of all you should fill `data` field');
    }
    this._clusters = structure.map(cluster => this.normalizeHelper.normalizeObject(cluster, this._minMax));
    return this._clusters;
  }

  /** Returns prepared clusters (denormalized). */
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
