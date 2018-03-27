const data = require('./data');
const AnalogAdaptiveResonance = require('../../../dist/adaptive-resonance/').AnalogAdaptiveResonance;
const NormalizeHelper = require('../../../dist/formulas/normalize').NormalizeHelper;
const assert = require('chai').assert;

describe('Basic flow', () => {
  it('learn should work', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;

    const clusters = aar.learn(data);
    assert.isArray(clusters);
    assert.isOk(clusters.length);
  });

  it('re-learn should work', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;

    for (let i = 1; i < 10; i++) {
      const clusters = aar.learn(data);
      assert.isArray(clusters);
      assert.isOk(clusters.length);

      assert.equal(aar._normalizedVectors.length, data.length * i);
    }
  });

  it('clusterify should work', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    
    const cluster = aar.clusterify(data[0]);

    assert.isArray(cluster);
    assert.equal(cluster.length, data[0].length);
    assert.equal(aar.clusters.length, 1);
  });

  it('clusterify should work (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);
    
    const cluster = aar.clusterify(data[0]);

    assert.isArray(cluster);
  });

  it('re-clusterify should work', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    
    for (let i = 1; i < 10; i++) {
      const cluster = aar.clusterify(data[0]);
  
      assert.isArray(cluster);
      assert.equal(cluster.length, data[0].length);
      assert.equal(aar.clusters.length, 1);
    }
  });

  it('re-clusterify should work (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);
    
    for (let i = 1; i < 10; i++) {
      const cluster = aar.clusterify(data[0]);
  
      assert.isArray(cluster);
      assert.equal(aar.clusters.length, 3);
    }
  });

  it('getClosestCluster should work', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);

    const cluster = aar.getClosestCluster(data[0]);
    assert.isArray(cluster);
    assert.equal(aar._normalizedVectors.length, data.length);
  });
});