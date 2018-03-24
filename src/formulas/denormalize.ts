import { get, set } from 'lodash';
import { chain } from 'mathjs';

export default class Denormalize {
  public standard(min: number, max: number, target: number) {
    // (target * (max - min)) + min
    return chain(max)
      .subtract(min)
      .multiply(target)
      .add(min)
      .done();
  }

  public extended(min: number, max: number, target: number) {
    return chain(target)
      .subtract(1)
      .multiply(2)
      .multiply(chain(max).subtract(min))
      .subtract(min)
      .done();
  }

  public denormalizeObject<T extends object>(target: T, minMax): T {
    const denormalized = {} as T;
    Object.keys(target).forEach(key => {
      const value = get(target, key);
      const min = get(minMax, key).min;
      const max = get(minMax, key).max;
      const denormalize = min < 0 ? this.extended : this.standard;
      set(denormalized, key, denormalize.call(this, min, max, value));
    });
    return denormalized;
  }
}