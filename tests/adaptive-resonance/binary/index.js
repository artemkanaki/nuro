const assert = require('chai').assert;
const data = require('./data');
const arrayData = require('./array-data');
const { BinaryAdaptiveResonance, BinaryArrayAdaptiveResonance } = require('../../../dist/adaptive-resonance');
const Clone = require('../../../dist/helpers/clone');

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

  it('Clusterify by new input should work', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7;
    bar.lambda = 2;
    bar.speed = .6;
    const cluster = bar.clusterify(data[0]);

    assert.isObject(cluster);
  });

  it('Getting closest cluster without changing clusters should work', () => {
    const bar = new BinaryAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    bar.learn(data);
    const cluster = bar.getClosestCluster(data[0]);

    assert.isObject(cluster);
  });
});

describe('Binary array adaptive resonance', () => {
  it('Basic flow should work', () => {
    const bar = new BinaryArrayAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    bar.learn(arrayData);

    const clusters = bar.clusters;
    assert.isArray(clusters);
    assert.equal(clusters.length, 2);
  });

  it('Clusterify by new input should work', () => {
    const bar = new BinaryArrayAdaptiveResonance();
    bar.range = .7;
    bar.lambda = 2;
    bar.speed = .6;
    const cluster = bar.clusterify(arrayData[0]);

    assert.isObject(cluster);
  });

  it('Getting closest cluster without changing clusters should work', () => {
    const bar = new BinaryArrayAdaptiveResonance();
    bar.range = .7
    bar.lambda = 2;
    bar.speed = .6;
    bar.learn(arrayData);
    const cluster = bar.getClosestCluster(arrayData[0]);

    assert.isObject(cluster);
  });
});