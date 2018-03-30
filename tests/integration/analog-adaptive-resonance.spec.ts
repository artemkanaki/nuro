import data from './data/analog-adaptive-resonance.data';
import { AnalogAdaptiveResonance } from '../../src/adaptive-resonance/analog/index';
import { NormalizeHelper } from '../../src/formulas/normalize';

describe('Basic flow', () => {
  it('should learn', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;

    const got = aar.learn(data);

    expect(got).toEqual([
      [
        0.29526117275192837, 0.46853002020515067, 0.36664142284001316, 0.31658331727741396, 0.33959421293529624,
        0.37005135639883474, 0.29434558166344, 0.13608713923727633
      ],
      [
        0.7879182458729166, 0, 0.010821252702830415, 0.32179939292090143, 0.17008968073957698, 0.05222199232273769,
        0.40648517808566675, 0
      ],
      [
        0, 0, 0.1439519315725143, 0.5005601256953338, 0.30129474050061134, 0.6055908845464395, 0.5207672818652722, 0
      ]
    ]);
  });

  it('should re-learn', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;

    for (let i = 1; i < 10; i++) {
      const got = aar.learn(data);

      expect(Array.isArray(got)).toBeTruthy();
      expect(got.length).toBeGreaterThan(0);

      expect((aar as any)._normalizedVectors.length).toEqual(data.length * i);
    }
  });

  it('should clusterify', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    
    const got = aar.clusterify(data[0]);

    expect(aar.clusters.length).toEqual(1);

    expect(Array.isArray(got)).toBeTruthy();
    expect(got).toEqual(
      [
        0.35355339059327373, 0.35355339059327373, 0.35355339059327373, 0.35355339059327373, 0.35355339059327373,
        0.35355339059327373, 0.35355339059327373, 0.35355339059327373
      ]
    );
  });

  it('should clusterify (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);
    
    const got = aar.clusterify(data[0]);

    expect(aar.clusters.length).toEqual(3);
    expect(got).toEqual(
      [
        0.38316159895751056, 0.4697960226841217, 0.22257588018359764, 0.342969384412874, 0.3341210687338433,
        0.36641163041738983, 0.3065025934604131, 0.20263271966523608
      ]
    );
  });

  it('should re-clusterify', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    
    for (let i = 1; i < 10; i++) {
      const got = aar.clusterify(data[0]);
  
      expect(Array.isArray(got)).toBeTruthy();
      expect(aar.clusters.length).toEqual(1);
    }
  });

  it('should re-clusterify (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);
    
    for (let i = 1; i < 10; i++) {
      const got = aar.clusterify(data[0]);
  
      expect(Array.isArray(got)).toBeTruthy();
      expect(aar.clusters.length).toEqual(3);
    }
  });

  it('should get closest cluster', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = .5;
    aar.range = .8;
    aar.learn(data);

    const clusterCount = aar.clusters.length;
    const got = aar.getClosestCluster(data[0]);

    expect(got).toEqual(
      [
        0.29526117275192837, 0.46853002020515067, 0.36664142284001316, 0.31658331727741396, 0.33959421293529624,
        0.37005135639883474, 0.29434558166344, 0.13608713923727633
      ]
    );
    expect(clusterCount).toEqual(aar.clusters.length);
    expect((aar as any)._normalizedVectors.length).toEqual(data.length);
  });
});