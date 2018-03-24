import { set, get } from 'lodash';
import * as math from 'mathjs';

export default class Normalize {
  private _round: number = 10;

  public standard(min: number, max: number, target: number): number {
    // (target) - min) / (max - min)
    return math
      .chain(target)
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
    return math
      .chain(2)
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
}