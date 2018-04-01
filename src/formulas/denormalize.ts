import BigNumber from 'bignumber.js';

export class DenormalizeHelper {

  public standard(min: BigNumber, max: BigNumber, target: BigNumber): BigNumber {
    // (target * (max - min)) + min
    return max
      .minus(min)
      .multipliedBy(target)
      .plus(min);
  }

  public extended(min: BigNumber, max: BigNumber, target: BigNumber): BigNumber {
    return target
      .minus(1)
      .multipliedBy(2)
      .multipliedBy(max.minus(min))
      .minus(min);
  }

  public denormalize(target: BigNumber[], minMax: [BigNumber, BigNumber][]): BigNumber[] {
    const denormalized: BigNumber[] = [];

    target.forEach((value, index) => {
      const min = minMax[index][0];
      const max = minMax[index][1];

      const denormalize = min.isLessThan(0) ? this.extended : this.standard;

      denormalized[index] = denormalize.call(this, min, max, value);
    });

    return denormalized;
  }

}
