export type Cluster = [number, number][];
export type ClusterObject<T> = {[P in keyof T]: T[P] & { shortMemory: number, longMemory: number }};
export type InputItem = number[];

export interface IAdaptiveResonance {
  learn(data: InputItem[]): Cluster[];
  clusterify(item: InputItem): Cluster;
  getClosestCluster(item: InputItem): Cluster;
}