import { DenormalizeHelper, EuclideanHelper, MinMax, MinMaxHelper, NormalizeHelper } from '../formulas';
import { CloneHelper } from '../helpers';
import { InputDataExpected, UnexpectedWorkFlow, InvalidInputData } from '../exceptions';
import BigNumber from 'bignumber.js';

type InputItem = BigNumber[];
type Cluster = InputItem;
type NormalizedVector = InputItem;

// src: http://neuronus.com/theory/961-nejronnye-seti-kokhonena.html
export class Kohonen {
  private _minMax: MinMax;
  private _normalized: NormalizedVector[] = [];
  private _clusters: Cluster[] = [];

  private _speed: BigNumber = new BigNumber(.5);
  private _delta: BigNumber = new BigNumber(-0.05);
  private _range: BigNumber = new BigNumber(.6);
  private _iterations: BigNumber;

  /** Configures how fast neural network will learn. value should be less or equal to 1 and bigger than 0 */
  public get speed(): BigNumber {
    return this._speed;
  }
  /** Configures how fast neural network will learn. value should be less or equal to 1 and bigger than 0 */
  public set speed(value) {
    this._speed = value;
  }

  /** Configures how much will decrease in the next iteration. value should be less than 0 */
  public get delta(): BigNumber {
    return this._delta;
  }
  /** Configures how much will decrease in the next iteration. value should be less than 0 */
  public set delta(value) {
    this._delta = value;
  }

  public get range(): BigNumber {
    return this._range;
  }
  public set range(value) {
    this._range = value;
  }

  /** Configures how many iterations will be when learning will be started */
  public get iterations(): BigNumber {
    return this._iterations;
  }
  /** Configures how many iterations will be when learning will be started */
  public set iterations(value) {
    this._iterations = value;
  }

  public get clusters(): Cluster[] {
    return this._clusters;
  }

  private denormalizeHelper: DenormalizeHelper = new DenormalizeHelper();
  private normalizeHelper: NormalizeHelper = new NormalizeHelper();
  private euclideanHelper: EuclideanHelper = new EuclideanHelper();
  private cloneHelper: CloneHelper = new CloneHelper();
  private minMaxHelper: MinMaxHelper = new MinMaxHelper();

  /** 
   * Sets data which will be clusterified
   * 
   * @param items {InputItem} data which should be set for clusterify in future
   * 
   * @example
   * 
   * const kohonen = new Kohonen();
   *
   * kohonen.setData([
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ]);
   */
  public setData(items: InputItem[]): void {
    if (!(items instanceof Array)) {
      throw new InvalidInputData('argument `items` should be instance of Array');
    } else if (!items.length) {
      throw new InvalidInputData('argument `items` should has at least one element')
    }

    const cloned: InputItem[] = this.cloneHelper.deepClone(items);

    this._minMax = this.minMaxHelper.getMinMax(cloned);

    this._normalized = cloned.map(item => this.normalizeHelper.normalize(item, this._minMax));
  }

  /**
   * Preparing clusters
   * 
   * @example
   * const kohonen = new Kohonen();
   *
   * kohonen.setData([
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ]);
   *
   * kohonen.iterations = new BigNumber(1);
   * kohonen.range = new BigNumber(.5);
   *
   * // here you can get clusters which was created by learning
   * // clusters === kohonen.clusters;
   * const clusters = kohonen.learn();
   */
  public learn(): Cluster[] {
    do {
      this.buildClusters();

      this.speed = this.speed.plus(this.delta);

      if (this.iterations) {
        this.iterations = this.iterations.minus(1);
      }
    } while (this.speed.isGreaterThan(0) && (this.iterations || this.iterations.isGreaterThan(0)))

    return this._clusters;
  }

  /**
   * Finds and return closest cluster to specified item (exists clusters will not be mutated)
   * 
   * @param item {InputItem} data which will be clusterify
   * 
   * @example
   * 
   * const kohonen = new Kohonen();
   *
   * kohonen.setData([
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ]);
   *
   * kohonen.iterations = new BigNumber(1);
   * kohonen.range = new BigNumber(.5);
   *
   * kohonen.learn();
   *
   * const dataToClusterify: BigNumber[] = [ new BigNumber(5), new BigNumber(6), ... ];
   * 
   * const cluster = kohonen.clusterify(dataToClusterify);
   */
  public clusterify(item: InputItem): Cluster {
    if (!this.clusters.length) {
      throw new UnexpectedWorkFlow('Clusters are not prepared yet');
    }

    const normalized = this.normalizeHelper.normalize(item, this._minMax);

    return this.getClosestCluster(normalized);
  }

  /**
   * Sets clusters (input data should not be denormalized, this operation will be done automatically)
   * 
   * @param structure {Cluster[]} data which will be set as cluster structure
   * 
   * @example
   * const kohonen = new Kohonen();
   * 
   * kohonen.setData(bigNumberData);
   *
   * const clusters: BigNumber[][] = [
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ];
   * kohonen.setClusterStructure(clusters);
   *
   * const dataToClusterify: BigNumber[] = [ new BigNumber(2), new BigNumber(5), ... ];
   *
   * const cluster = kohonen.clusterify(dataToClusterify);
   */
  public setClusterStructure(structure: Cluster[]): Cluster[] {
    if (!this._minMax) {
      throw new UnexpectedWorkFlow('First of all you should fill `data` field');
    }

    this._clusters = structure.map(cluster => this.normalizeHelper.normalize(cluster, this._minMax));

    return this._clusters;
  }

  /**
   * Returns prepared clusters (denormalized).
   * 
   * @example
   * 
   * const kohonen = new Kohonen();
   *
   * kohonen.setData(bigNumberData);
   *
   * const inputClusters = [
   *   [ new BigNumber(32), new BigNumber(5200), ... ],
   *   [ new BigNumber(20), new BigNumber(1000), ... ],
   *   ...
   * ];
   * kohonen.setClusterStructure(clusters);
   *
   * let denormalizedClusters = kohonen.getDenormalizedClusters();
   *
   * // NOTICE: denormalizedClusters !== kohonen.clusters;
   * expect(denormalizedClusters).toEqual(inputClusters);
   */
  public getDenormalizedClusters(): Cluster[] {
    return this._clusters.map(cluster => this.denormalizeHelper.denormalize(cluster, this._minMax));
  }

  private buildClusters(): Cluster[] {
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
  private getClosestCluster(item: InputItem, range?: BigNumber): Cluster {
    let closestDistance: BigNumber;

    return this._clusters.reduce((closest, candidate) => {
      const candidateDistance = this.euclideanHelper.getEuclideanDistance(candidate, item);

      if (
        (!closest && (!range || candidateDistance.isLessThan(range)))
        || (
          closest
          && closestDistance.isGreaterThan(candidateDistance)
          && (!range || candidateDistance.isLessThanOrEqualTo(range))
        )
      ) {
        closestDistance = candidateDistance;

        return candidate;
      }

      return closest;
    }, null);
  }

  private recalculateCluster(cluster: Cluster, item: InputItem): Cluster {
    for (let index = 0; index < cluster.length; index++) {
      const clusterValue = cluster[index];
      const itemValue = item[index];

      const recalculated = clusterValue
        .plus(
          itemValue
            .minus(clusterValue)
            .multipliedBy(this.speed)
        );

      cluster[index] = recalculated;
    }

    return cluster;
  }
}
