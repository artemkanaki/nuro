const assert = require('chai').assert;

const data = require('./data');
const Kohonen = require('../../dist/kohonen').Kohonen;
const exceptions = require('../../dist/exceptions');


describe('Kohonen', () => {
  it('Learning should work', () => {
    const kohonen = new Kohonen();
    kohonen.setData(data);
    kohonen.iterations = 1;
    kohonen.learn(0.5);
    assert.ok(kohonen.clusters.length);
    assert.equal(kohonen.clusters.length, 3);
  });

  it('Clusterify alg should work', () => {
    const kohonen = new Kohonen();
    kohonen.setData(data);
    kohonen.iterations = 1;
    kohonen.learn(0.5);

    const dataToClusterify = { age: 25, salary: 500 }
    const cluster = kohonen.clusterify(dataToClusterify);
    assert.ok(cluster);
    assert.ok(cluster.age);
    assert.ok(cluster.salary);
  });

  it('Clusterization alg should work after setting cluster structure', () => {
    const kohonen = new Kohonen();
    kohonen.setData(data);

    const clusters = [
      { age: 32, salary: 5200 },
      { age: 20, salary: 1000 }
    ];
    kohonen.setClusterStructure(clusters);

    const dataToClusterify = { age: 30, salary: 0 }
    const cluster = kohonen.clusterify(dataToClusterify);
    assert.isObject(cluster);
    assert.equal(cluster.salary, 0);
    assert.equal(cluster.salary, 0);
  });

  it('Clusters\' denormalize alg should work', () => {
    const kohonen = new Kohonen();
    kohonen.setData(data);

    const clusters = [
      { age: 32, salary: 5200 },
      { age: 20, salary: 1000 }
    ].sort();
    kohonen.setClusterStructure(clusters);
    let denormalized = kohonen.getDenormalizedClusters();

    assert.isArray(denormalized);
    assert.equal(denormalized.length, 2);
    denormalized = denormalized.sort();
    assert.deepEqual(clusters, denormalized);
  });

  describe('Wrong usage', () => {
    it('If argument of method `setData` is not an Array, then exception should be thrown', () => {
      const kohonen = new Kohonen();
      try {
        kohonen.setData({});
        assert.ok(null, '`setData` does not throw the exception');
      } catch (ex) {
        assert.instanceOf(ex, exceptions.InvalidInputData);
      }
    });

    it('If argument of method `setData` is an empty array, then exception should be thrown', () => {
      const kohonen = new Kohonen();
      try {
        kohonen.setData([]);
        assert.ok(null, '`setData` does not throw the exception');
      } catch (ex) {
        assert.instanceOf(ex, exceptions.InvalidInputData);
      }
    });

    it('If user call `learn` method and does not set data, then exception should be thrown', () => {
      const kohonen = new Kohonen();
      try {
        kohonen.learn(.5);
        assert.ok(null, '`setData` does not throw the exception');
      } catch (ex) {
        assert.instanceOf(ex, exceptions.InputDataExpected);
      }
    });

    it('If user call `learn` method and does not set data, then exception should be thrown', () => {
      const kohonen = new Kohonen();
      try {
        kohonen.learn(.5);
        assert.ok(null, '`setData` does not throw the exception');
      } catch (ex) {
        assert.instanceOf(ex, exceptions.InputDataExpected);
      }
    });
  });
});