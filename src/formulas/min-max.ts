import { maxBy, head, get, set, minBy } from 'lodash';
import { InvalidInputData } from '../exceptions'

export default class MinMax {
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
}