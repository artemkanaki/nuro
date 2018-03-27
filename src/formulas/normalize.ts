import { set, get } from 'lodash';
import { chain } from 'mathjs';
import { CloneHelper } from '../helpers/clone';

export class NormalizeHelper {
  private cloneHelper = new CloneHelper();

  public standard(min: number, max: number, target: number): number {
    // (target) - min) / (max - min)
    return chain(target)
      .subtract(min)
      .divide(
        math
          .chain(max)
          .subtract(min)
          .done()
      )
      .done();
  }

  public extended(min: number, max: number, target: number): number {
    // 2 * ((target - min) / (max - min)) - 1
    return chain(2)
      .multiply(this.standard(min, max, target))
      .subtract(1)
      .done();
  }

  public normalizeObject<T extends object>(target: T, minMax): T {
    const normalized = {} as T;
    Object.keys(target).forEach(key => {
      const value = get(target, key);
      const min = get(minMax, key).min;
      const max = get(minMax, key).max;
      const normalize = min < 0 ? this.extended : this.standard;
      set(normalized, key, normalize.call(this, min, max, value));
    });
    return normalized;
  }

  public normalizeArray(target: number[], minMax: [number, number][]): number[] {
    const denormalized = [];
    target.forEach((value, index) => {
      const min = minMax[index][0];
      const max = minMax[index][1];
      const denormalize = min < 0 ? this.extended : this.standard;
      denormalized[index] = denormalize.call(this, min, max, value);
    });
    return denormalized;
  }

  public getNormalizedVector(vector: number[]): number[] {
    const module = this.getVectorsModule(vector);
    return this
      .cloneHelper
      .deepClone(vector)
      .map((clone: number[]) => clone.map(val => chain(val).divide(module).done()));

  }

  public getVectorsModule(vector: number[]): number {
    return vector.reduce((total, val) => total.add(chain(val).pow(2)), chain(0)).sqrt().done();
  }
}