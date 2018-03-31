import { CloneHelper } from '../helpers';
import { NormalizeHelper, DenormalizeHelper, MinMax, MinMaxHelper } from '../formulas';
import { chain } from 'mathjs';

type InputItem = number[];
type Cluster = InputItem;

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class AnalogAdaptiveResonance {
  private _clusters: number[][] = [];
  private _range: number = .5;
  private _speed: number = .5;
  private _minMax: MinMax = [];
  private _normalizedVectors: number[][] = [];

  public get range(): number {
    return this._range;
  }
  public set range(val) {
    this._range = val;
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
  public set clusters(val) {
    this._clusters = val;
  }

  private cloneHelper: CloneHelper = new CloneHelper();
  private normalizeHelper: NormalizeHelper = new NormalizeHelper();
  private denormalizeHelper: DenormalizeHelper = new DenormalizeHelper();
  private minMaxHelper: MinMaxHelper = new MinMaxHelper();

  public learn(data: InputItem[]) {
    const normalizedVectors = this.processInputData(data);
    return this.buildClusters(normalizedVectors);
  }

  public clusterify(item: InputItem) {
    return this.learn([ item ])[0];
  }

  public getClosestCluster(item: number[]): Cluster {
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
        existsMinMaxItem[0] = existsMinMaxItem[0] > candidateMinMaxItem[0] ? candidateMinMaxItem[0] : existsMinMaxItem[0];
        existsMinMaxItem[1] = existsMinMaxItem[1] < candidateMinMaxItem[1] ? candidateMinMaxItem[1] : existsMinMaxItem[1];
      }
    } else {
      this._minMax = candidateMinMax;
    }
    return this._minMax;
  }

  private buildClusters(vectors: number[][]): Cluster[] {
    vectors.map(vector => {
      const closestCluster = this.getClosestClusterForNormalizedVector(vector);
      if (closestCluster) {
        this.recalculateCluster(closestCluster, vector);
      } else {
        this.clusters.push(vector);
      }
    });
    return this.clusters;
  }

  private getClosestClusterForNormalizedVector(vector: number[]): Cluster {
    let closestSimilarity;
    const closestCluster = this.clusters.reduce((closest, candidate) => {
      let total = chain(0);
      for (let index = 0; index < vector.length; index++) {
        total = total.add(chain(candidate[index]).multiply(vector[index]).done())
      }
      const totalNumber = total.done();

      if ((!closestSimilarity && totalNumber >= this.range) || (totalNumber > closestSimilarity)) {
        closestSimilarity = totalNumber;
        return candidate;
      }
      return closest;
    }, null);

    return closestCluster;
  }

  private recalculateCluster(cluster: number[], vector: number[]): Cluster {
    for (let index = 0; index < cluster.length; index++) {
      // NOTICE: (1 - v) * w + v * x, w = cluster[index], x = vector[index], v = this.speed
      cluster[index] = chain(1)
        .subtract(this.speed)
        .multiply(cluster[index])
        .add(
          chain(this.speed)
            .multiply(vector[index])
            .done()
        )
        .done();
    }

    return cluster;
  }
}