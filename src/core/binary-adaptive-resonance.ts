import { get, set } from 'lodash';
import BigNumber from 'bignumber.js';

type InputItem = BigNumber[];
type Cluster = [BigNumber, BigNumber][];

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class BinaryAdaptiveResonance {
  //#region props
  private _clusters: Cluster[] = [];
  private _range: BigNumber = new BigNumber(.6);
  private _lambda: BigNumber = new BigNumber(2);
  private _speed: BigNumber = new BigNumber(.5);
  //#endregion

  //#region getters/setters
  public get range(): BigNumber {
    return this._range;
  }
  public set range(val) {
    this._range = val;
  }

  public get lambda(): BigNumber {
    return this._lambda;
  }
  public set lambda(val) {
    this._lambda = val;
  }

  public get speed(): BigNumber {
    return this._speed;
  }
  public set speed(val) {
    this._speed = val;
  }

  public get clusters(): Cluster[] {
    return this._clusters;
  }
  //#endregion

  //#region public methods

  /**
   * Prepares clusters based on input data
   * 
   * If clusters are already exists, then them will be extended or recalculated
   * 
   * @param data {InputItem[]} input data
   * 
   * @example
   * const bar = new BinaryAdaptiveResonance();
   * 
   * aar.speed = new BigNumber(.5);
   * aar.range = new BigNumber(.8);
   * 
   * const data: BigNumber[][] = [
   *   [new BigNumber(0), new BigNumber(1)],
   *   [new BigNumber(1), new BigNumber(0)],
   *   ...
   * ];
   * 
   * // clusters which was prepared on last `learn` call
   * const clusters: BigNumber[][] = bar.learn(data);
   * 
   * ...
   * 
   * // clusters which were prepared on all `learn` calls
   * aar.clusters;
   */
  public learn(data: InputItem[]): Cluster[] {
    data.forEach(item => this.clusterify(item));

    return this._clusters;
  }

  /**
   * Finds, recalculate and return closest cluster, or create new one
   * 
   * @param item {InputItem} data which will be clusterify
   * 
   * @example
   * 
   * const bar = new AnalogAdaptiveResonance();
   * bar.speed = new BigNumber(.5);
   * bar.range = new BigNumber(.8);
   * 
   * const data: BigNumber[][] = [
   *   [new BigNumber(1), new BigNumber(0), ...],
   *   [new BigNumber(1), new BigNumber(1), ...]
   * ];
   * 
   * aar.learn(data);
   * 
   * // cluster === aar.clusters[1]
   * const cluster = aar.clusterify(
   *   [new BigNumber(0), new BigNumber(1), ...]
   * );
   */
  public clusterify(item: InputItem): Cluster {
    const closestCluster = this.getClosestCluster(item);

    if (closestCluster) {
      this.recalculateCluster(closestCluster, item);

      return closestCluster;
    } else {
      const cluster = this.createCluster(item);

      this.clusters.push(cluster);

      return cluster;
    }
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
   * const data: BigNumber[][]= [
   *   [new BigNumber(1), new BigNumber(0), ...],
   *   [new BigNumber(0), new BigNumber(0), ...],
   *   ...
   * ];
   * 
   * aar.learn(data);
   * 
   * const cluster = aar.getClosestCluster(
   *   [new BigNumber(0), new BigNumber(1), ...]
   * );
   */
  public getClosestCluster(item: InputItem): Cluster {
    const winner: { similarity: BigNumber, cluster: Cluster } = this
      ._clusters
      .map(cluster => ({ cluster, similarity: this.calcClustersQualitativeSimilarity(cluster, item) }))
      .filter(({ similarity }) => similarity >= this.range)
      .sort((a, b) => {
        if (a.similarity.isGreaterThan(b.similarity)) {
          return -1;
        } else if (a.similarity.isLessThan(b.similarity)) {
          return 1;
        }

        return 0;
      })
      .find(({ cluster }) => {
        const quantitativeSimilarity = this.calcClustersQuantitativeSimilarity(cluster, item);

        if (quantitativeSimilarity.isGreaterThan(this._range)) {
          return true;
        }
      });

      if (winner) {
        return winner.cluster;
      }

      return null;
  }
  //#endregion

  //#region private methods
  private calcClustersQualitativeSimilarity(cluster: Cluster, item: InputItem): BigNumber {
    return item
      .reduce(
        (total: BigNumber, value, index) =>
          total.plus(cluster[index][0].multipliedBy(item[index])),
        new BigNumber(0),
      );
  }

  private calcClustersQuantitativeSimilarity(cluster: Cluster, item: InputItem): BigNumber {
    let itemSum = new BigNumber(0);
    let itemClusterSum = new BigNumber(0);

    for (let index = 0; index < cluster.length; index++) {
      const longMemory = cluster[index][1];
      const itemValue = item[index];

      itemSum = itemSum.plus(itemValue);
      itemClusterSum = itemClusterSum.plus(itemValue.multipliedBy(longMemory));
    }

    return itemClusterSum.div(itemSum);
  }

  private createCluster(item: InputItem): Cluster {
    const cluster: Cluster = [];
    item.forEach((value, index) => {
      const shortMemory = this.calculateShortMemory(item, index);

      cluster[index] = [shortMemory, value];
    });
    return cluster;
  }

  private calculateShortMemory(item: InputItem, index: number): BigNumber {
    return this._lambda
      .multipliedBy(item[index])
      .div(
        this._lambda
          .minus(1)
          .plus(
            item.reduce((total: BigNumber, value) => total.plus(value), new BigNumber(0))
          )
      );
  }

  private recalculateShortMemory(cluster: Cluster, item: InputItem, index: number): BigNumber {
    const oldShortMemory = cluster[index][0];

    const newShortMemory = new BigNumber(1)
      .minus(this.speed)
      .multipliedBy(oldShortMemory)
      .plus(
        this.speed.multipliedBy(this.calculateShortMemory(item, index))
      );

    return newShortMemory;
  }

  private recalculateLongMemory(cluster: Cluster, item: InputItem, index: number): BigNumber {
    const oldLongMemory = cluster[index][1];

    const newLongMemory = new BigNumber(1)
      .minus(this.speed)
      .multipliedBy(oldLongMemory)
      .plus(
        this.speed.multipliedBy(item[index])
      );

    return newLongMemory;
  }

  private recalculateCluster(cluster: Cluster, item: InputItem): Cluster {
    for (let index = 0; index < cluster.length; index++) {
      const itemValue = item[index];

      cluster[index][0] = this.recalculateShortMemory(cluster, item, index);
      cluster[index][1] = this.recalculateLongMemory(cluster, item, index);
    }

    return cluster;
  }
  //#endregion
}
