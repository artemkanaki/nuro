import { CloneHelper } from '../helpers';
import { logger } from '../tools';
import BigNumber from 'bignumber.js';
import { format } from 'util';

export class NormalizeHelper {
  private cloneHelper = new CloneHelper();

  public logs = true;

  public standard(min: BigNumber, max: BigNumber, target: BigNumber): BigNumber {
    // (target - min) / (max - min)
    return target
      .minus(min)
      .div(max.minus(min));
  }

  public extended(min: BigNumber, max: BigNumber, target: BigNumber): BigNumber {
    // 2 * ((target - min) / (max - min)) - 1
    return new BigNumber(2)
      .multipliedBy(this.standard(min, max, target))
      .minus(1);
  }

  public normalize(target: BigNumber[], minMax: [BigNumber, BigNumber][]): BigNumber[] {
    const normalized: BigNumber[] = [];

    target.forEach((value, index) => {
      const min = minMax[index][0];
      const max = minMax[index][1];

      if (min.isEqualTo(max)) {
        if (this.logs) {
          logger.warn(format(
            'All values in %s column are the same (`min` === `max`). All values in this column will be equal to 0.5',
            index,
          ));
        }

        normalized[index] = new BigNumber(.5);

        return;
      }

      const normalize = min.isLessThan(0) ? this.extended : this.standard;

      const normalizedValue = normalize.call(this, min, max, value);

      normalized[index] = normalizedValue;
    });

    return normalized;
  }

  public getNormalizedVector(vector: BigNumber[]): BigNumber[] {
    const module = this.getVectorsModule(vector);

    return this
      .cloneHelper
      .deepClone(vector)
      .map((val: BigNumber) => val.div(module));
  }

  public getVectorsModule(vector: BigNumber[]): BigNumber {
    return vector
      .reduce(
        (total: BigNumber, val) => total.plus(val.pow(2)),
        new BigNumber(0)
      )
      .sqrt();
  }
}