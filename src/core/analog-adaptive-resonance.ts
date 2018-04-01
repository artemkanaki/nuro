import { CloneHelper } from '../helpers';
import { NormalizeHelper, DenormalizeHelper, MinMax, MinMaxHelper } from '../formulas'; 
import { logger } from '../tools'
import BigNumber from 'bignumber.js';

type InputItem = BigNumber[];
type Cluster = InputItem;
type Vector = InputItem;

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class AnalogAdaptiveResonance {
  private _clusters: Cluster[] = [];
  private _range: BigNumber = new BigNumber(.5);
  private _speed: BigNumber = new BigNumber(.5);
  private _minMax: MinMax = [];
  private _normalizedVectors: Vector[] = [];

  public get range(): BigNumber {
    return this._range;
  }
  public set range(range: BigNumber) {
    this._range = range;
  }

  public get speed(): BigNumber {
    return this._speed;
  }
  public set speed(speed: BigNumber) {
    if (typeof speed === 'number' || typeof speed === 'string') {
      speed = new BigNumber(speed);
    }

    this._speed = speed;
  }

  public get clusters(): Cluster[] {
    return this._clusters;
  }
  public set clusters(clusters: Cluster[]) {
    this._clusters = clusters;
  }

  private cloneHelper: CloneHelper = new CloneHelper();
  private normalizeHelper: NormalizeHelper = new NormalizeHelper();
  private denormalizeHelper: DenormalizeHelper = new DenormalizeHelper();
  private minMaxHelper: MinMaxHelper = new MinMaxHelper();

  /**
   * Prepares clusters based on input data
   * 
   * @param data {InputItem[]} input data
   * 
   * If clusters are already exists, then them will be extended or recalculated
   * 
   * @example
   * const aar = new AnalogAdaptiveResonance();
   * 
   * aar.speed = new BigNumber(.5);
   * aar.range = new BigNumber(.8);
   * 
   * const data: BigNumber[][] = [
   *   [ new BigNumber(200), new BigNumber(500), ... ],
   *   [ new BigNumber(800), new BigNumber(300), ... ],
   *   ...
   * ];
   * 
   * // clusters which was prepared on last `learn` call
   * const clusters: BigNumber[][] = aar.learn(data);
   * 
   * ...
   * 
   * // clusters which were prepared on all `learn` calls
   * aar.clusters;
   */
  public learn(data: InputItem[]) {
    const normalizedVectors = this.processInputData(data);
    return this.buildClusters(normalizedVectors);
  }

  /**
   * Finds, recalculate and return closest cluster, or create new one
   * 
   * @param item {InputItem} data which will be clusterify
   * 
   * @example
   * 
   * const aar = new AnalogAdaptiveResonance();
   * aar.speed = new BigNumber(.5);
   * aar.range = new BigNumber(.8);
   * 
   * const data: BigNumber[][] = [
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ];
   * 
   * aar.learn(data);
   * 
   * // cluster === aar.clusters[1]
   * const cluster = aar.clusterify(
   *   [ new BigNumber(9), new BigNumber(3), ... ]
   * );
   */
  public clusterify(item: InputItem) {
    return this.learn([ item ])[0];
  }

  /**
   * Finds and return closest cluster, or if input data are too different, then return null
   * Instead of `clusterify` this method does not mutate cluster array
   * 
   * @param item {InputItem} data which will be clusterify
   * 
   * @example
   * 
   * const aar = new AnalogAdaptiveResonance();
   * aar.speed = new BigNumber(.5);
   * aar.range = new BigNumber(.8);
   * 
   * const data: BigNumber[][] = [
   *   [ new BigNumber(2), new BigNumber(5), ... ],
   *   [ new BigNumber(8), new BigNumber(3), ... ],
   *   ...
   * ];
   * 
   * aar.learn(data);
   * 
   * const cluster = aar.getClosestCluster(
   *   [ new BigNumber(9), new BigNumber(3), ... ]
   * );
   * 
   * // probably `anotherOne` will be equal `null`
   * const anotherOne = aar.getClosestCluster(
   *   [ new BigNumber(999), new BigNumber(321), ... ]
   * );
   */
  public getClosestCluster(item: InputItem): Cluster {
    const vector = this.normalizeHelper.normalize(item, this._minMax);
    const normalizedVector = this.normalizeHelper.getNormalizedVector(vector);
    return this.getClosestClusterForNormalizedVector(normalizedVector);
  }

  private processInputData(data: InputItem[]) {
    const candidateMinMax = this.minMaxHelper.getMinMax(data);
    this.completeMinMax(candidateMinMax);

    const normalizedData = data.map(item => this.normalizeHelper.normalize(item, this._minMax));

    const normalizedVectors = normalizedData.map(vector => this.normalizeHelper.getNormalizedVector(vector));
    this._normalizedVectors.push(...normalizedVectors);

    return normalizedVectors;
  }

  private completeMinMax(candidateMinMax: MinMax): MinMax {
    if (this._minMax.length) {
      for (let index = 0; index < this._minMax.length; index++) {
        const existsMinMaxItem = this._minMax[index];
        const candidateMinMaxItem = candidateMinMax[index];

        existsMinMaxItem[0] = existsMinMaxItem[0].isGreaterThan(candidateMinMaxItem[0])
          ? candidateMinMaxItem[0]
          : existsMinMaxItem[0];

        existsMinMaxItem[1] = existsMinMaxItem[1].isLessThan(candidateMinMaxItem[1])
          ? candidateMinMaxItem[1]
          : existsMinMaxItem[1];
      }
    } else {
      this._minMax = candidateMinMax;
    }

    return this._minMax;
  }

  private buildClusters(vectors: Vector[]): Cluster[] {
    vectors.forEach(vector => {
      const closestCluster = this.getClosestClusterForNormalizedVector(vector);

      if (closestCluster) {
        this.recalculateCluster(closestCluster, vector);
      } else {
        this.clusters.push(vector);
      }
    });

    return this.clusters;
  }

  private getClosestClusterForNormalizedVector(vector: Vector): Cluster {
    let closestSimilarity: BigNumber;

    const closestCluster = this.clusters.reduce((closest, candidate) => {
      let total = new BigNumber(0);

      for (let index = 0; index < vector.length; index++) {
        total = total.plus(
          candidate[index].multipliedBy(vector[index])
        );
      }

      if (
        (!closestSimilarity && total.isGreaterThanOrEqualTo(this.range))
        || (closestSimilarity && total.isGreaterThan(closestSimilarity))
      ) {
        closestSimilarity = total;

        return candidate;
      }

      return closest;
    }, null);

    return closestCluster;
  }

  private recalculateCluster(cluster: Cluster, vector: Vector): Cluster {
    for (let index = 0; index < cluster.length; index++) {
      // NOTICE: (1 - v) * w + v * x, w = cluster[index], x = vector[index], v = this.speed
      cluster[index] = new BigNumber(1)
        .minus(this.speed)
        .multipliedBy(cluster[index])
        .plus(
          this.speed.multipliedBy(vector[index])
        );
    }

    return cluster;
  }
}
