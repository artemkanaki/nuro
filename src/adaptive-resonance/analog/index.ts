import { CloneHelper } from '../../helpers/clone';
import { NormalizeHelper } from '../../formulas/normalize';
import { DenormalizeHelper } from '../../formulas/denormalize';
import { MinMaxHelper, MinMax } from '../../formulas/min-max';
import { chain } from 'mathjs';

type InputItem = number[];
type Cluster = InputItem;

// src: http://neuronus.com/theory/962-nejronnye-seti-adaptivnogo-rezonansa.html
export class AnalogAdaptiveResonance {
  private _clusters: number[][];
  private _range: number = .5;
  private _speed: number = .5;
  private _minMax: MinMax;
  private _normalizedVectors: number[][];

  public get range() {
    return this._range;
  }
  public set range(val) {
    this._range = val;
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
  public set clusters(val) {
    this._clusters = val;
  }

  private cloneHelper: CloneHelper = new CloneHelper();
  private normalizeHelper: NormalizeHelper = new NormalizeHelper();
  private denormalizeHelper: DenormalizeHelper = new DenormalizeHelper();
  private minMaxHelper: MinMaxHelper = new MinMaxHelper();

  public learn(data: InputItem[]) {
    const normalizedVectors = this.processInputData(data);
    this.buildClusters(normalizedVectors);
  }

  public clusterify(item: InputItem) {
    return this.learn([ item ]);
  }

  private processInputData(data: InputItem[]) {
    const candidateMinMax = this.minMaxHelper.getMinMaxFromArray(data);
    this.completeMinMax(candidateMinMax);

    const normalizedData = data.map(item => this.normalizeHelper.normalizeArray(item, this._minMax));
    const normalizedVectors = normalizedData.map(vector => this.normalizeHelper.getNormalizedVector(vector));
    this._normalizedVectors.push(...normalizedVectors);
    return normalizedVectors;
  }

  private completeMinMax(candidateMinMax: MinMax) {
    if (this._minMax) {
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

  private buildClusters(vectors: number[][]) {
    vectors.map(vector => {
      const closestCluster = this.getClosestCluster(vector);
      if (closestCluster) {
        this.recalculateCluster(closestCluster, vector);
      } else {
        this._clusters.push(vector);
      }
    });
    return this._clusters;
  }

  private getClosestCluster(vector: number[]) {
    let closestSimilarity;
    const closestCluster = this._clusters.reduce((closest, candidate) => {
      const total = chain(0);
      for (let index = 0; index < vector.length; index++) {
        total.add(chain(candidate[index]).add(vector[index]).done())
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

  private createCluster(vector: number[]) {
  }

  private recalculateCluster(cluster: number[], vector: number[]) {
    for (let index = 0; index < cluster.length; index++) {
      // NOTICE: (1 - v) * w + v * x, w = cluster[index], v = vector[index]
      cluster[index] = chain(1 - this.speed)
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