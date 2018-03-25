import Clone from '../helpers/clone';
import { get, set } from 'lodash';
import { chain } from 'mathjs';

type Cluster<T> = {[P in keyof T]: T[P] & { shortMemory: number, longMemory: number }};

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class BinaryAdaptiveResonance<T> {
  private _clusters: Cluster<T>[] = [];
  private _range: number = .6;
  private _lambda: number = 2;
  private _speed: number = .5;

  public get range() {
    return this._range;
  }
  public set range(val) {
    this._range = val;
  }

  public get lambda() {
    return this._lambda;
  }
  public set lambda(val) {
    this._lambda = val;
  }

  public get speed() {
    return this._speed;
  }
  public set speed(val) {
    this._speed = val;
  }

  public get clusters() {
    return this._clusters;
  }

  private cloneHelper: Clone;
  constructor() {
    this.cloneHelper = new Clone();
  }

  public learn(data: T[]): Cluster<T>[] {
    data.forEach(item => this.clusterify(item));
    return this._clusters;
  }

  public clusterify(item): Cluster<T> {
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

  public getClosestCluster(item): Cluster<T> {
    const winner: { similarity: number, cluster: Cluster<T> } = this
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

  private calcClustersQualitativeSimilarity(cluster: Cluster<T>, item: T) {
    return Object
      .keys(item)
      .reduce(
        (total: mathjs.IMathJsChain, key) =>
          total.add(chain(get(cluster, `${key}.shortMemory`)).multiply(get(item, key)).done()),
        chain(0),
      )
      .done();
  }

  private calcClustersQuantitativeSimilarity(cluster: Cluster<T>, item: T) {
    let itemSum = 0;
    let itemClusterSum = 0;
    Object.keys(item).forEach(key => {
      const itemsValue = get(item, key);
      const longMemory = get(cluster, `${key}.longMemory`);
      itemSum += itemsValue;
      itemClusterSum += itemsValue * longMemory;
    });
    return chain(itemClusterSum).divide(itemSum).done();
  }

  private createCluster(item: T): Cluster<T> {
    const cluster: Cluster<T> = {} as any;
    Object.keys(item).forEach(key => {
      set(cluster, `${key}.longMemory`, get(item, key));
      set(cluster, `${key}.shortMemory`, this.calculateShortMemory(item, key));
    });
    return cluster;
  }

  private calculateShortMemory(item: T, propName: string): number {
    return chain(this._lambda)
      .multiply(get(item, propName))
      .divide(
        chain(this._lambda)
          .subtract(1)
          .add(
            Object
              .keys(item)
              .reduce((total: mathjs.IMathJsChain, key) => total.add(get(item, key)), chain(0))
              .done()
          )
          .done()
      )
      .done();
  }

  private recalculateShortMemory(cluster, item, propName) {
    const oldShortMemory = get(cluster, `${propName}.shortMemory`);
    const newShortMemory = chain(1)
      .subtract(this.speed)
      .multiply(oldShortMemory)
      .add(
        chain(this.speed).multiply(this.calculateShortMemory(item, propName)).done()
      )
      .done();
    return newShortMemory;
  }

  private recalculateLongMemory(cluster, item, propName) {
    const oldLongMemory = get(cluster, `${propName}.longMemory`);
    const newLongMemory = chain(1)
      .subtract(this.speed)
      .multiply(oldLongMemory)
      .add(
        chain(this.speed).multiply(get(item, propName)).done()
      )
      .done();
    return newLongMemory;
  }

  private recalculateCluster(cluster: Cluster<T>, item) {
    Object.keys(cluster).forEach(key => {
      set(cluster, `${key}.shortMemory`, this.recalculateShortMemory(cluster, item, key));
      set(cluster, `${key}.longMemory`, this.recalculateLongMemory(cluster, item, key));
    });
    return cluster;
  }
}