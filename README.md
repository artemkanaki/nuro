# nuro
Library for usage different neuron networks and combine them.

# Classes

## Kohonen

May be used for build Kohonen's neuron layer. Accepts any numeric values. Public methods:

- setData

```javascript
const kohonen = new Kohonen();

kohonen.setData([
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
]);
```

- learn

```javascript
const kohonen = new Kohonen();

kohonen.setData([
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
]);

kohonen.iterations = new BigNumber(1);
kohonen.range = new BigNumber(.5);

// here you can get clusters which was created by learning
// clusters === kohonen.clusters;
const clusters = kohonen.learn();
```

- clusterify

```javascript
const kohonen = new Kohonen();

kohonen.setData([
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
]);

kohonen.iterations = new BigNumber(1);
kohonen.range = new BigNumber(.5);

kohonen.learn();

const dataToClusterify: BigNumber[] = [ new BigNumber(5), new BigNumber(6), ... ];

const cluster = kohonen.clusterify(dataToClusterify);
```

- setClusterStructure

```javascript
const kohonen = new Kohonen();

kohonen.setData(bigNumberData);

const clusters: BigNumber[][] = [
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
];
kohonen.setClusterStructure(clusters);

const dataToClusterify: BigNumber[] = [ new BigNumber(2), new BigNumber(5), ... ];

const cluster = kohonen.clusterify(dataToClusterify);
```

- getDenormalizedClusters

```javascript
const kohonen = new Kohonen();

kohonen.setData(bigNumberData);

const inputClusters = [
  [ new BigNumber(32), new BigNumber(5200), ... ],
  [ new BigNumber(20), new BigNumber(1000), ... ],
  ...
];
kohonen.setClusterStructure(clusters);

let denormalizedClusters = kohonen.getDenormalizedClusters();

// NOTICE: denormalizedClusters !== kohonen.clusters;
expect(denormalizedClusters).toEqual(inputClusters);
```

## BinaryAdaptiveResonance

May be used for analysis binary data by ART-1 method (with long/short memory). Allows only binary data: `1 || 0`. Public methods:

- learn

```javascript
const bar = new BinaryAdaptiveResonance();

bar.speed = new BigNumber(.5);
bar.range = new BigNumber(.8);

const data: BigNumber[][] = [
  [new BigNumber(0), new BigNumber(1)],
  [new BigNumber(1), new BigNumber(0)],
  ...
];

// clusters which was prepared on last `learn` call
const clusters: BigNumber[][] = bar.learn(data);

...

// clusters which were prepared on all `learn` calls
bar.clusters;
```

- clusterify

```javascript
const bar = new AnalogAdaptiveResonance();
bar.speed = new BigNumber(.5);
bar.range = new BigNumber(.8);

const data: BigNumber[][] = [
  [new BigNumber(1), new BigNumber(0), ...],
  [new BigNumber(1), new BigNumber(1), ...]
];

bar.learn(data);

// cluster === bar.clusters[1]
const cluster = bar.clusterify(
  [new BigNumber(0), new BigNumber(1), ...]
);
```

- getClosestCluster

```javascript
const bar = new AnalogAdaptiveResonance();
bar.speed = new BigNumber(.5);
bar.range = new BigNumber(.8);

const data: BigNumber[][]= [
  [new BigNumber(1), new BigNumber(0), ...],
  [new BigNumber(0), new BigNumber(0), ...],
  ...
];

bar.learn(data);

const cluster = bar.getClosestCluster(
  [new BigNumber(0), new BigNumber(1), ...]
);
```

## AnalogAdaptiveResonance

May be used for analysis data by ART-2 method. Accepts any numeric values. Public methods:

- learn

```javascript
const aar = new AnalogAdaptiveResonance();

aar.speed = new BigNumber(.5);
aar.range = new BigNumber(.8);

const data: BigNumber[][] = [
  [ new BigNumber(200), new BigNumber(500), ... ],
  [ new BigNumber(800), new BigNumber(300), ... ],
  ...
];

// clusters which was prepared on last `learn` call
const clusters: BigNumber[][] = aar.learn(data);

...

// clusters which were prepared on all `learn` calls
aar.clusters;
```

- clusterify

```javascript
const aar = new AnalogAdaptiveResonance();
aar.speed = new BigNumber(.5);
aar.range = new BigNumber(.8);

const data: BigNumber[][] = [
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
];

aar.learn(data);

// cluster === aar.clusters[1]
const cluster = aar.clusterify(
  [ new BigNumber(9), new BigNumber(3), ... ]
);
```

- getClosestCluster

```javascript
const aar = new AnalogAdaptiveResonance();
aar.speed = new BigNumber(.5);
aar.range = new BigNumber(.8);

const data: BigNumber[][] = [
  [ new BigNumber(2), new BigNumber(5), ... ],
  [ new BigNumber(8), new BigNumber(3), ... ],
  ...
];

aar.learn(data);

const cluster = aar.getClosestCluster(
  [ new BigNumber(9), new BigNumber(3), ... ]
);

// probably `anotherOne` will be equal `null`
const anotherOne = aar.getClosestCluster(
  [ new BigNumber(999), new BigNumber(321), ... ]
);
```

For more info you may look into tests.

# Tests
```bash
npm test
```