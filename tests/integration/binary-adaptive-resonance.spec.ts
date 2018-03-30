import data from './data/binary-adaptive-resonance.data';
import { BinaryAdaptiveResonance } from '../../src/adaptive-resonance/binary';

describe('Binary array adaptive resonance', () => {
  it('should learn', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    const got = bar.learn(data);

    expect(got).toEqual(bar.clusters);
    expect(got).toEqual(
      [
        [
          [0.3733333333333333, 1], [0, 0], [0.3733333333333333, 1], [0, 0], [0.3733333333333333, 1], [0, 0],
          [0.3733333333333333, 1], [0, 0], [0.13333333333333333, 0.4]
        ],
        [
          [0, 0], [0.36, 1], [0.19999999999999998, 0.6], [0.36, 1], [0, 0], [0.36, 1], [0, 0],[0.36, 1], [0, 0]
        ]
      ]
    );
  });

  it('should clusterify', () => {
    const bar = new BinaryAdaptiveResonance();

    bar.range = .7;
    bar.lambda = 2;
    bar.speed = .6;

    const got = bar.clusterify(data[0]);

    expect(got).toEqual(bar.clusters[0]);
  });

  it('Getting closest cluster without changing clusters should work', () => {
    const bar = new BinaryAdaptiveResonance();

    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;

    const clusters = bar.learn(data);

    const got = bar.getClosestCluster(data[0]);

    expect(got).toEqual(clusters[0]);
  });
});