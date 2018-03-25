const assert = require('chai').assert;
const data = require('./data');
const BinaryAdaptiveResonance = require('../../../dist/adaptive-resonance').BinaryAdaptiveResonance;

describe('Binary adaptive resonance', () => {
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
});