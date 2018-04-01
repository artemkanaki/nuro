import data from './data/analog-adaptive-resonance.data';
import { AnalogAdaptiveResonance } from '../../src/core/analog-adaptive-resonance';
import { NormalizeHelper } from '../../src/formulas/normalize';
import BigNumber from 'bignumber.js';
import { convertDataToBigNumber, convertToNumberArray, convertToNumberArrayArray } from './helpers/bignumber-convertor';

describe('Basic flow', () => {
  let bigNumberData: BigNumber[][];

  beforeEach(() => {
    bigNumberData = convertDataToBigNumber(data);
  });

  it('should learn', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);

    const got = aar.learn(bigNumberData);

    expect(convertToNumberArray(got)).toEqual([
      [
        0.29526117275192837, 0.46853002020515067, 0.36664142284001316, 0.31658331727741396, 0.33959421293529624,
        0.37005135639883474, 0.29434558166344, 0.1360871392372763
      ],
      [
        0.7879182458729166, 0, 0.010821252702830415, 0.3217993929209014, 0.17008968073957695, 0.05222199232273769,
        0.40648517808566675, 0
      ],
      [
        0, 0, 0.14395193157251432, 0.5005601256953338, 0.30129474050061134, 0.6055908845464395, 0.5207672818652723, 0
      ]
    ]);
  });

  it('should re-learn', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);

    for (let i = 1; i < 10; i++) {
      const got = aar.learn(bigNumberData);

      expect(Array.isArray(got)).toBeTruthy();
      expect(got.length).toBeGreaterThan(0);

      expect((aar as any)._normalizedVectors.length).toEqual(bigNumberData.length * i);
    }
  });

  it('should clusterify', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);
    
    const got = aar.clusterify(bigNumberData[0]);

    expect(aar.clusters.length).toEqual(1);

    expect(convertToNumberArray(got)).toEqual(
      [
        0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738, 0.3535533905932738,
        0.3535533905932738, 0.3535533905932738, 0.3535533905932738
      ]
    );
  });

  it('should clusterify (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);

    aar.learn(bigNumberData);
    
    const got = aar.clusterify(bigNumberData[0]);

    expect(aar.clusters.length).toEqual(3);
    expect(convertToNumberArray(got)).toEqual(
      [
        0.3831615989575105, 0.4697960226841217, 0.22257588018359764, 0.342969384412874, 0.33412106873384323,
        0.36641163041738983, 0.30650259346041314, 0.20263271966523608
      ]
    );
  });

  it('should re-clusterify', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);
    
    for (let i = 1; i < 10; i++) {
      const got = aar.clusterify(bigNumberData[0]);
  
      expect(got).toEqual(aar.clusters[0]);
      expect(aar.clusters.length).toEqual(1);
    }
  });

  it('should re-clusterify (extended)', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);

    aar.learn(bigNumberData);
    
    for (let i = 1; i < 10; i++) {
      const got = aar.clusterify(bigNumberData[0]);
  
      expect(got).toEqual(aar.clusters[0]);
      expect(aar.clusters.length).toEqual(3);
    }
  });

  it('should get closest cluster', () => {
    const aar = new AnalogAdaptiveResonance();
    aar.speed = new BigNumber(.5);
    aar.range = new BigNumber(.8);

    aar.learn(bigNumberData);

    const clusterCount = aar.clusters.length;
    const got = aar.getClosestCluster(bigNumberData[0]);

    expect(convertToNumberArray(got)).toEqual(
      [
        0.29526117275192837, 0.46853002020515067, 0.36664142284001316, 0.31658331727741396, 0.33959421293529624,
        0.37005135639883474, 0.29434558166344, 0.1360871392372763
      ]
    );
    expect(clusterCount).toEqual(aar.clusters.length);
    expect((aar as any)._normalizedVectors.length).toEqual(bigNumberData.length);
  });
});