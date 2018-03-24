import { InvalidInputData } from '../exceptions';
import * as math from 'mathjs';

export default class Euclidean {
  getEuclideanDistance(from: object, to: object): number {
    const coordinatesName = Object.keys(from);
    const invalidCoordinates = Object.keys(to).filter(key => !coordinatesName.includes(key));
    if (invalidCoordinates.length) {
      throw new InvalidInputData(
        'Both parameters should have equal keys, instead the second one has extra fields: ' + invalidCoordinates.join(),
      );
    }
    return coordinatesName
      .reduce((total: mathjs.IMathJsChain, key) => {
        const fromKey: number = from[key];
        const toKey: number = to[key];
        return total
          .add(
            math
              .chain(fromKey)
              .subtract(toKey)
              .pow(2)
              .done()
          );
      }, math.chain(0))
      .sqrt()
      .done();
  }
}