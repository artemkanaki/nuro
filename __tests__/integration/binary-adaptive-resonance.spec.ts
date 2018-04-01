import data from './data/binary-adaptive-resonance.data';
import { BinaryAdaptiveResonance } from '../../src/core';
import BigNumber from 'bignumber.js';
import { convertDataToBigNumber, convertToNumberArray, convertToNumberArrayArray } from './helpers/bignumber-convertor';

describe('Binary array adaptive resonance', () => {
  let bigNumberData: BigNumber[][];

  beforeEach(() => {
    bigNumberData = convertDataToBigNumber(data);
  });

  it('should learn', () => {
    const bar = new BinaryAdaptiveResonance();

    bar.range = new BigNumber(.7);
    bar.lambda = new BigNumber(2);
    bar.speed = new BigNumber(.6);

    const got = bar.learn(bigNumberData);

    expect(got).toEqual(bar.clusters);
    expect(convertToNumberArray(got)).toEqual(
      [
        [
          [0.37333333333333335, 1], [0, 0], [0.37333333333333335, 1], [0, 0], [0.37333333333333335, 1], [0, 0],
          [0.37333333333333335, 1], [0, 0], [0.13333333333333333, 0.4]
        ],
        [
          [0, 0], [0.36, 1], [0.2, 0.6], [0.36, 1], [0, 0], [0.36, 1], [0, 0], [0.36, 1], [0, 0]
        ]
      ]
    );
  });

  it('should clusterify', () => {
    const bar = new BinaryAdaptiveResonance();

    bar.range = new BigNumber(.7);
    bar.lambda = new BigNumber(2);
    bar.speed = new BigNumber(.6);

    const got = bar.clusterify(bigNumberData[0]);

    expect(got).toEqual(bar.clusters[0]);
    expect(convertToNumberArray(got)).toEqual(
      [
        [0.3333333333333333, 1], [0, 0], [0.3333333333333333, 1], [0, 0], [0.3333333333333333, 1], [0, 0],
        [0.3333333333333333, 1], [0, 0], [0.3333333333333333, 1]
      ]
    );
  });

  it('Getting closest cluster without changing clusters should work', () => {
    const bar = new BinaryAdaptiveResonance();

    bar.range = new BigNumber(.7);
    bar.lambda = new BigNumber(2);
    bar.speed = new BigNumber(.6);

    const clusters = bar.learn(bigNumberData);

    const got = bar.getClosestCluster(bigNumberData[0]);

    expect(got).toEqual(clusters[0]);
    expect(got).toEqual(bar.clusters[0]);
    expect(convertToNumberArray(got)).toEqual(
      [
        [0.37333333333333335, 1], [0, 0], [0.37333333333333335, 1], [0, 0], [0.37333333333333335, 1], [0, 0],
        [0.37333333333333335, 1], [0, 0], [0.13333333333333333, 0.4]
      ]
    );
  });
});