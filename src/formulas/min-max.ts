import BigNumber from 'bignumber.js';
import { CloneHelper } from '../helpers';
import { minBy, maxBy } from 'lodash';

export type MinMax = [BigNumber, BigNumber][];

export class MinMaxHelper {
  private cloneHelper = new CloneHelper();

  // NOTICE: works great after refactoring
  getMinMax(data: BigNumber[][]): MinMax {
    const dataClone = this.cloneHelper.deepClone(data);

    const minMax: MinMax = [];

    for (let index = 0; index < data[0].length; index++) {
      const min = minBy(data, val => val[index].toNumber())[index];
      const max = maxBy(data, val => val[index].toNumber())[index];

      minMax[index] = [ min, max ];
    }

    return minMax;
  }
}