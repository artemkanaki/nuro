import { maxBy, head, get, set, minBy } from 'lodash';
import { InvalidInputData } from '../exceptions'

export type MinMax = [number, number][];
export class MinMaxHelper {
  getMinMaxConfig<T>(data: T[]): { [P in keyof T]: T[P] & { min: number, max: number } } {
    const minMax: any = {};
    if (!(data instanceof Array)) {
      throw new InvalidInputData('`data` should be an array of objects');
    }
    Object.keys(head(data)).forEach(key => {
      set(minMax, `${key}.max`, get(maxBy(data, item => get(item, key)), key));
      set(minMax, `${key}.min`, get(minBy(data, item => get(item, key)), key));
    });
    return minMax;
  }

  getMinMaxFromArray(data: number[][]): MinMax {
    const minMax = [];
    if (!(data instanceof Array)) {
      throw new InvalidInputData('`data` should be an array of number arrays');
    }
    for (let index = 0; index < data[0].length; index++) {
      minMax[index] = [
        minBy(data, item => item[index])[index],
        maxBy(data, item => item[index])[index],
      ];
    }
    return minMax;
  }
}