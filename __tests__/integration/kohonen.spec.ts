import data from './data/kohonen.data';
import { Kohonen } from '../../src/core';
import { InvalidInputData, InputDataExpected } from '../../src/exceptions';
import { convertDataToBigNumber, convertToNumberArray } from './helpers/bignumber-convertor';
import BigNumber from 'bignumber.js';

describe('Kohonen', () => {
  let bigNumberData: BigNumber[][];

  beforeEach(() => {
    bigNumberData = convertDataToBigNumber(data);
  });

  it('should set data', () => {
    const kohonen = new Kohonen();

    kohonen.setData(bigNumberData);

    const normalized: BigNumber[][] = (kohonen as any)._normalized;

    for (let index = 0; index < normalized[0].length; index++) {
      const column: number[] = normalized.map(row => row[index].toNumber());

      expect(Math.max(...column)).toEqual(1);
      expect(Math.min(...column)).toEqual(0);
      expect(column.find(val => val < -1 || val > 1)).toBeUndefined();
    }
  });

  it('should learn', () => {
    const kohonen = new Kohonen();

    kohonen.setData(bigNumberData);

    kohonen.iterations = new BigNumber(1);
    kohonen.range = new BigNumber(.5);

    const got = kohonen.learn();

    expect(convertToNumberArray(got)).toEqual(
      [
        [ 0.03224211820833333, 0.04606016886904762 ],
        [ 1, 0.47619047619047616 ],
        [ 0.39781756975, 0.99844112125 ]
      ]
    );
    expect(got).toEqual(kohonen.clusters);
  });

  it('should clusterify', () => {
    const kohonen = new Kohonen();

    kohonen.setData(bigNumberData);

    kohonen.iterations = new BigNumber(1);
    kohonen.range = new BigNumber(.5);

    kohonen.learn();

    const dataToClusterify = [new BigNumber(25), new BigNumber(500)];
    const got = kohonen.clusterify(dataToClusterify);

    expect(convertToNumberArray(got)).toEqual([ 0.03224211820833333, 0.04606016886904762 ]);
  });

  it('should set cluster structure', () => {
    const kohonen = new Kohonen();

    kohonen.setData(bigNumberData);

    const clusters = [
      [ new BigNumber(32), new BigNumber(5200) ],
      [ new BigNumber(20), new BigNumber(1000) ]
    ];
    kohonen.setClusterStructure(clusters);

    const dataToClusterify = [ new BigNumber(30), new BigNumber(0) ];

    const got = kohonen.clusterify(dataToClusterify);

    expect(got).toEqual(kohonen.clusters[1]);
  });

  it('should denormalize clusters', () => {
    const kohonen = new Kohonen();

    kohonen.setData(bigNumberData);

    const clusters = [
      [ new BigNumber(32), new BigNumber(5200) ],
      [ new BigNumber(20), new BigNumber(1000) ]
    ];
    kohonen.setClusterStructure(clusters);

    let got = kohonen.getDenormalizedClusters();

    expect(got).toEqual(clusters);
  });

  describe('Wrong usage', () => {
    it('should throw InvalidInputData exception (`setData` method)', () => {
      const kohonen = new Kohonen();

      expect(() => kohonen.setData({} as any)).toThrow(InvalidInputData);
    });

    it('should throw InvalidInputData exception (`setData` method)', () => {
      const kohonen = new Kohonen();

      expect(() => kohonen.setData([])).toThrow(InvalidInputData);
    });

    it('should throw InputDataExpected exception (`learn` method)', () => {
      const kohonen = new Kohonen();
      kohonen.range = new BigNumber(.5);

      expect(() => kohonen.learn()).toThrow(InputDataExpected);
    });
  });
});