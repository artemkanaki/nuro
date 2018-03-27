# nuro
Library for usage different neuron networks and combine them.

#Classes

## Kohonen

May be used for build Kohonen's neuron layer. Accepts any numeric values. Public methods:

- setData
- learn
- clusterify
- setClusterStructure
- getDenormalizedClusters

## BinaryAdaptiveResonance

May be used for analysis binary data by ART-1 method (with long/short memory). Allows only binary data: `1 || 0`. Public methods:
- learn
- clusterify
- getClosestCluster

## AnalogAdaptiveResonance

May be used for analysis data by ART-2 method. Accepts any numeric values. Public methods:
- learn
- clusterify
- getClosestCluster

For more info you may look into tests. Docs will be available soon.

# Tests
```bash
npm test
```