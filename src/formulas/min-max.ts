import BigNumber from 'bignumber.js';

export type MinMax = [number, number][];

export class MinMaxHelper {

  getMinMax(data: BigNumber[][]): MinMax {
    const minMax = [];

    for (let index = 0; index < data[0].length; index++) {
      const min = this.sortByInternalValue(data, index, false);
      const max = this.sortByInternalValue(data, index, true);

      minMax[index] = [ min, max ];
    }

    return minMax;
  }

  private sortByInternalValue(data: BigNumber[][], index: number, asc: boolean) {
    const sorted = data.sort((a, b) => {
      const aValue = a[index];
      const bValue = b[index];

      if (aValue.isLessThan(bValue)) {
        return asc ? 1 : -1;
      } else if (aValue.isGreaterThan(bValue)) {
        return asc ? -1 : 1;
      }

      return 0;
    });

    return sorted[0][index];
  }
}