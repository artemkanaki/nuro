import data from './data/kohonen';
import { Kohonen } from '../../src/kohonen';
import { InvalidInputData, InputDataExpected } from '../../src/exceptions';

describe('Kohonen', () => {
  it('should set data', () => {
    const kohonen = new Kohonen();

    kohonen.setData(data);

    expect(kohonen.data.length).toEqual(data.length);
  });

  it('should learn', () => {
    const kohonen = new Kohonen();

    kohonen.setData(data);

    kohonen.iterations = 1;
    kohonen.range = .5;

    const got = kohonen.learn();

    expect(got).toEqual(
      [
        [0.016666666666666666, 0.023809523809523808],
        [1, 0.47619047619047616],
        [0.3666666666666667 ,0.9761904761904762]
      ]
    );
    expect(got).toEqual(kohonen.clusters);
  });

  it('should clusterify', () => {
    const kohonen = new Kohonen();

    kohonen.setData(data);

    kohonen.iterations = 1;
    kohonen.range = .5;

    kohonen.learn();

    const dataToClusterify = [25, 500];
    const got = kohonen.clusterify(dataToClusterify);

    expect(got).toEqual([ 0.016666666666666666, 0.023809523809523808 ]);
  });

  it('should set cluster structure', () => {
    const kohonen = new Kohonen();

    kohonen.setData(data);

    const clusters = [
      [ 32, 5200 ],
      [ 20, 1000 ]
    ];
    kohonen.setClusterStructure(clusters);

    const dataToClusterify = [ 30, 0 ];

    const got = kohonen.clusterify(dataToClusterify);

    expect(got).toEqual(kohonen.clusters[1]);
  });

  it('should denormalize clusters', () => {
    const kohonen = new Kohonen();

    kohonen.setData(data);

    const clusters = [
      [ 32, 5200 ],
      [ 20, 1000 ]
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
      kohonen.range = .5;

      expect(() => kohonen.learn()).toThrow(InputDataExpected);
    });
  });
});