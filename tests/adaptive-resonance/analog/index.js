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
    assert.equal(clusters.length, 3);
    assert.deepEqual(clusters, [
      [0.29526117275192837, 0.46853002020515067, 0.36664142284001316, 0.31658331727741396, 0.33959421293529624, 0.37005135639883474, 0.29434558166344, 0.13608713923727633],
      [0.7879182458729166, 0, 0.010821252702830415, 0.32179939292090143, 0.17008968073957698, 0.05222199232273769, 0.40648517808566675, 0],
      [0, 0, 0.1439519315725143, 0.5005601256953338, 0.30129474050061134, 0.6055908845464395, 0.5207672818652722, 0]
    ]);
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
    assert.deepEqual(
      cluster,
      [0.35355339059327373,0.35355339059327373,0.35355339059327373,0.35355339059327373,0.35355339059327373,0.35355339059327373,0.35355339059327373,0.35355339059327373]
    );
  });

  it('clusterify should work (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);
    
    const cluster = aar.clusterify(data[0]);

    assert.isArray(cluster);
    assert.deepEqual(
      cluster,
      [0.38316159895751056,0.4697960226841217,0.22257588018359764,0.342969384412874,0.3341210687338433,0.36641163041738983,0.3065025934604131,0.20263271966523608]
    );
    assert.equal(aar.clusters.length, 3);
    assert.deepEqual()
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

    const clusterCount = aar.clusters.length;
    const cluster = aar.getClosestCluster(data[0]);
    assert.isArray(cluster);
    assert.equal(clusterCount, aar.clusters.length);
    assert.equal(aar._normalizedVectors.length, data.length);
  });
});