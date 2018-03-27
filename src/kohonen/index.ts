import { EuclideanHelper } from '../formulas/euclidean';
import { DenormalizeHelper } from '../formulas/denormalize';
import { NormalizeHelper } from '../formulas/normalize';
import { MinMax, MinMaxHelper } from '../formulas/min-max';
import { CloneHelper } from '../helpers/clone';
import { InputDataExpected, UnexpectedWorkFlow, InvalidInputData } from '../exceptions';
import { get, set } from 'lodash';
import * as math from 'mathjs';

// src: http://neuronus.com/theory/961-nejronnye-seti-kokhonena.html
export class Kohonen {
  private _data: number[][] = [];
  private _minMax: MinMax;
  private _normalized: number[][] = [];
  private _clusters: number[][] = [];

  private _speed: number = .5;
  private _delta: number = -0.05;
  private _range: number = .6;
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

  public get range() {
    return this._range;
  }
  public set range(value) {
    this._range = value;
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

  private denormalizeHelper: DenormalizeHelper;
  private normalizeHelper: NormalizeHelper;
  private euclideanHelper: EuclideanHelper;
  private cloneHelper: CloneHelper;
  private minMaxHelper: MinMaxHelper;

  constructor() {
    this.denormalizeHelper = new DenormalizeHelper();
    this.normalizeHelper = new NormalizeHelper();
    this.euclideanHelper = new EuclideanHelper();
    this.cloneHelper = new CloneHelper();
    this.minMaxHelper = new MinMaxHelper();
  }

  /** Sets data which will be clusterized */
  public setData(value: number[][]) {
    if (!(value instanceof Array)) {
      throw new InvalidInputData('argument `value` should be instance of Array');
    } else if (!value.length) {
      throw new InvalidInputData('argument `value` should has at least one element')
    }
    this._data = this.cloneHelper.deepClone(value);
    this._minMax = this.minMaxHelper.getMinMaxFromArray(this.data);
    this._normalized = this._data.map(item => this.normalizeHelper.normalizeArray(item, this._minMax));
  }

  /** Preparing clusters */
  public learn(): number[][] {
    do {
      this.buildClusters();
      this.speed = math.chain(this.speed).add(this.delta).done();
      if (this.iterations) {
        this.iterations--;
      }
    } while (this.speed > 0 && (this.iterations || this.iterations > 0))
    return this._clusters;
  }

  /** Returns closest cluster to specified item */
  public clusterify(item: number[]) {
    if (!this.clusters.length) {
      throw new UnexpectedWorkFlow('Clusters are not prepared yet');
    }
    const normalized = this.normalizeHelper.normalizeArray(item, this._minMax);
    return this.getClosestCluster(normalized);
  }

  /** Sets clusters (input data should not be denormalized, this operation will be done automatically) */
  public setClusterStructure(structure: number[][]): number[][] {
    if (!this._minMax) {
      throw new UnexpectedWorkFlow('First of all you should fill `data` field');
    }
    this._clusters = structure.map(cluster => this.normalizeHelper.normalizeArray(cluster, this._minMax));
    return this._clusters;
  }

  /** Returns prepared clusters (denormalized). */
  public getDenormalizedClusters() {
    return this._clusters.map(cluster => this.denormalizeHelper.denormalizeArray(cluster, this._minMax));
  }

  private buildClusters(): number[][] {
    if (!this._normalized.length) {
      throw new InputDataExpected('First of all you should fill `data` field')
    }
    this._normalized.forEach((item, index) => {
      const closestCluster = this.getClosestCluster(item, this.range);
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
  private getClosestCluster(item: number[], range?: number): number[] {
    let closestDistance: number;
    return this._clusters.reduce((closest, candidate) => {
      const candidateDistance = this.euclideanHelper.getEuclideanDistanceFromArray(candidate, item);
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

  private recalculateCluster(cluster: number[], item: number[]) {
    for (let index = 0; index < cluster.length; index++) {
      const clusterValue = cluster[index];
      const itemValue = item[index];
      const recalculated = math
        .chain(clusterValue)
        .add(
          math
            .chain(itemValue)
            .subtract(clusterValue)
            .multiply(this.speed)
            .done()
        )
        .done();
      cluster[index] = recalculated;
    }
    return cluster;
  }
}
