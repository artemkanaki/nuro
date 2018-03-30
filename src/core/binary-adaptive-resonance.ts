import { get, set } from 'lodash';
import { chain } from 'mathjs';

type InputItem = number[];
type Cluster = [number, number][];

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class BinaryAdaptiveResonance {
  //#region props
  private _clusters: Cluster[] = [];
  private _range: number = .6;
  private _lambda: number = 2;
  private _speed: number = .5;
  //#endregion

  //#region getters/setters
  public get range(): number {
    return this._range;
  }
  public set range(val) {
    this._range = val;
  }

  public get lambda(): number {
    return this._lambda;
  }
  public set lambda(val) {
    this._lambda = val;
  }

  public get speed(): number {
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
  public learn(data: InputItem[]): Cluster[] {
    data.forEach(item => this.clusterify(item));
    return this._clusters;
  }

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

  public getClosestCluster(item: InputItem): Cluster {
    const winner: { similarity: number, cluster: Cluster } = this
      ._clusters
      .map(cluster => ({ cluster, similarity: this.calcClustersQualitativeSimilarity(cluster, item) }))
      .filter(({ similarity }) => similarity >= this.range)
      .sort((a, b) => {
        if (a.similarity > b.similarity) {
          return -1;
        } else if (a.similarity < b.similarity) {
          return 1;
        }
        return 0;
      })
      .find(({ cluster }) => {
        const quantitativeSimilarity = this.calcClustersQuantitativeSimilarity(cluster, item);
        if (quantitativeSimilarity > this._range) {
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
  private calcClustersQualitativeSimilarity(cluster: Cluster, item: InputItem): number {
    return item
      .reduce(
        (total: mathjs.IMathJsChain, value, index) =>
          total.add(chain(cluster[index][0]).multiply(item[index]).done()),
        chain(0),
      )
      .done();
  }

  private calcClustersQuantitativeSimilarity(cluster: Cluster, item: InputItem): number {
    let itemSum = 0;
    let itemClusterSum = 0;
    item.forEach((value, index) => {
      const longMemory = cluster[index][1];
      itemSum += value;
      itemClusterSum += value * longMemory;
    });
    return chain(itemClusterSum).divide(itemSum).done();
  }

  private createCluster(item: InputItem): Cluster {
    const cluster: Cluster = [];
    item.forEach((value, index) => {
      const shortMemory = this.calculateShortMemory(item, index);
      cluster[index] = [shortMemory, value];
    });
    return cluster;
  }

  private calculateShortMemory(item: InputItem, index: number): number {
    return chain(this._lambda)
      .multiply(item[index])
      .divide(
        chain(this._lambda)
          .subtract(1)
          .add(
            item
              .reduce((total: mathjs.IMathJsChain, value) => total.add(value), chain(0))
              .done()
          )
          .done()
      )
      .done();
  }

  private recalculateShortMemory(cluster: Cluster, item: InputItem, index: number): number {
    const oldShortMemory = cluster[index][0];
    const newShortMemory = chain(1)
      .subtract(this.speed)
      .multiply(oldShortMemory)
      .add(
        chain(this.speed).multiply(this.calculateShortMemory(item, index)).done()
      )
      .done();
    return newShortMemory;
  }

  private recalculateLongMemory(cluster: Cluster, item: InputItem, index: number): number {
    const oldLongMemory = cluster[index][1];
    const newLongMemory = chain(1)
      .subtract(this.speed)
      .multiply(oldLongMemory)
      .add(
        chain(this.speed).multiply(item[index]).done()
      )
      .done();
    return newLongMemory;
  }

  private recalculateCluster(cluster: Cluster, item: InputItem): Cluster {
    item.forEach((value, index) => {
      cluster[index][0] = this.recalculateShortMemory(cluster, item, index);
      cluster[index][1] = this.recalculateLongMemory(cluster, item, index);
    });
    return cluster;
  }
  //#endregion
}