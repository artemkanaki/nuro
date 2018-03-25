const assert = require('chai').assert;
const data = require('./data');
const { BinaryAdaptiveResonance } = require('../../../dist/adaptive-resonance');

describe('Binary array adaptive resonance', () => {
  it('Basic flow should work', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    bar.learn(data);

    const clusters = bar.clusters;
    assert.isArray(clusters);
    assert.equal(clusters.length, 2);
  });

  it('Clusterify by new input should work', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7;
    bar.lambda = 2;
    bar.speed = .6;
    const cluster = bar.clusterify(data[0]);

    assert.isArray(cluster);
  });

  it('Getting closest cluster without changing clusters should work', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    bar.learn(data);
    const cluster = bar.getClosestCluster(data[0]);

    assert.isArray(cluster);
  });
});