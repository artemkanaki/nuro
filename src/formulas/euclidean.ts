import BigNumber from 'bignumber.js';

export class EuclideanHelper {

  public getEuclideanDistance(from: BigNumber[], to: BigNumber[]): BigNumber {
    if (from.length !== to.length) {
      return null;
    }

    let total = new BigNumber(0);
    for (let index = 0; index < from.length; index++) {
      total = total.plus(
        from[index]
          .minus(to[index])
          .pow(2),
      );
    }

    return total.sqrt();
  }

}
