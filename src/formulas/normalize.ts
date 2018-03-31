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
    return this
      .standard(min, max, target)
      .multipliedBy(2)
      .minus(1);
  }

  public normalize(target: BigNumber[], minMax: [BigNumber, BigNumber][]): number[] {
    const denormalized = [];

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

        denormalized[index] = .5;

        return;
      }

      const denormalize = min.isLessThan(0) ? this.extended : this.standard;

      const denormalizedValue = denormalize.call(this, min, max, value);

      denormalized[index] = denormalizedValue;
    });

    return denormalized;
  }

  public getNormalizedVector(vector: BigNumber[]): BigNumber[] {
    const module = this.getVectorsModule(vector);

    return this
      .cloneHelper
      .deepClone(vector)
      .map((val: BigNumber) => val.div(module));
  }

  public getVectorsModule(vector: BigNumber[]): BigNumber {
    return vector.reduce(
      (total: BigNumber, val) => total.plus(val),
      new BigNumber(0)
    );
  }
}