"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mathjs_1 = require("mathjs");
class BinaryAdaptiveResonance {
    constructor() {
        this._clusters = [];
        this._range = .6;
        this._lambda = 2;
        this._speed = .5;
    }
    get range() {
        return this._range;
    }
    set range(val) {
        this._range = val;
    }
    get lambda() {
        return this._lambda;
    }
    set lambda(val) {
        this._lambda = val;
    }
    get speed() {
        return this._speed;
    }
    set speed(val) {
        this._speed = val;
    }
    get clusters() {
        return this._clusters;
    }
    learn(data) {
        data.forEach(item => this.clusterify(item));
        return this._clusters;
    }
    clusterify(item) {
        const closestCluster = this.getClosestCluster(item);
        if (closestCluster) {
            this.recalculateCluster(closestCluster, item);
            return closestCluster;
        }
        else {
            const cluster = this.createCluster(item);
            this.clusters.push(cluster);
            return cluster;
        }
    }
    getClosestCluster(item) {
        const winner = this
            ._clusters
            .map(cluster => ({ cluster, similarity: this.calcClustersQualitativeSimilarity(cluster, item) }))
            .filter(({ similarity }) => similarity >= this.range)
            .sort((a, b) => {
            if (a.similarity > b.similarity) {
                return -1;
            }
            else if (a.similarity < b.similarity) {
                return 1;
            }
            return 0;
        })
            .find(({ cluster }) => {
            const quantitativeSimilarity = this.calcClustersQuantitativeSimilarity(cluster, item);
            if (quantitativeSimilarity > this._range) {
                return true;
            }
        });
        if (winner) {
            return winner.cluster;
        }
        return null;
    }
    calcClustersQualitativeSimilarity(cluster, item) {
        return Object
            .keys(item)
            .reduce((total, key) => total.add(mathjs_1.chain(lodash_1.get(cluster, `${key}.shortMemory`)).multiply(lodash_1.get(item, key)).done()), mathjs_1.chain(0))
            .done();
    }
    calcClustersQuantitativeSimilarity(cluster, item) {
        let itemSum = 0;
        let itemClusterSum = 0;
        Object.keys(item).forEach(key => {
            const itemsValue = lodash_1.get(item, key);
            const longMemory = lodash_1.get(cluster, `${key}.longMemory`);
            itemSum += itemsValue;
            itemClusterSum += itemsValue * longMemory;
        });
        return mathjs_1.chain(itemClusterSum).divide(itemSum).done();
    }
    createCluster(item) {
        const cluster = {};
        Object.keys(item).forEach(key => {
            lodash_1.set(cluster, `${key}.longMemory`, lodash_1.get(item, key));
            lodash_1.set(cluster, `${key}.shortMemory`, this.calculateShortMemory(item, key));
        });
        return cluster;
    }
    calculateShortMemory(item, propName) {
        return mathjs_1.chain(this._lambda)
            .multiply(lodash_1.get(item, propName))
            .divide(mathjs_1.chain(this._lambda)
            .subtract(1)
            .add(Object
            .keys(item)
            .reduce((total, key) => total.add(lodash_1.get(item, key)), mathjs_1.chain(0))
            .done())
            .done())
            .done();
    }
    recalculateShortMemory(cluster, item, propName) {
        const oldShortMemory = lodash_1.get(cluster, `${propName}.shortMemory`);
        const newShortMemory = mathjs_1.chain(1)
            .subtract(this.speed)
            .multiply(oldShortMemory)
            .add(mathjs_1.chain(this.speed).multiply(this.calculateShortMemory(item, propName)).done())
            .done();
        return newShortMemory;
    }
    recalculateLongMemory(cluster, item, propName) {
        const oldLongMemory = lodash_1.get(cluster, `${propName}.longMemory`);
        const newLongMemory = mathjs_1.chain(1)
            .subtract(this.speed)
            .multiply(oldLongMemory)
            .add(mathjs_1.chain(this.speed).multiply(lodash_1.get(item, propName)).done())
            .done();
        return newLongMemory;
    }
    recalculateCluster(cluster, item) {
        Object.keys(cluster).forEach(key => {
            lodash_1.set(cluster, `${key}.shortMemory`, this.recalculateShortMemory(cluster, item, key));
            lodash_1.set(cluster, `${key}.longMemory`, this.recalculateLongMemory(cluster, item, key));
        });
        return cluster;
    }
}
exports.BinaryAdaptiveResonance = BinaryAdaptiveResonance;
class BinaryArrayAdaptiveResonance {
    constructor() {
        this._clusters = [];
        this._range = .6;
        this._lambda = 2;
        this._speed = .5;
    }
    get range() {
        return this._range;
    }
    set range(val) {
        this._range = val;
    }
    get lambda() {
        return this._lambda;
    }
    set lambda(val) {
        this._lambda = val;
    }
    get speed() {
        return this._speed;
    }
    set speed(val) {
        this._speed = val;
    }
    get clusters() {
        return this._clusters;
    }
    learn(data) {
        data.forEach(item => this.clusterify(item));
        return this._clusters;
    }
    clusterify(item) {
        const closestCluster = this.getClosestCluster(item);
        if (closestCluster) {
            this.recalculateCluster(closestCluster, item);
            return closestCluster;
        }
        else {
            const cluster = this.createCluster(item);
            this.clusters.push(cluster);
            return cluster;
        }
    }
    getClosestCluster(item) {
        const winner = this
            ._clusters
            .map(cluster => ({ cluster, similarity: this.calcClustersQualitativeSimilarity(cluster, item) }))
            .filter(({ similarity }) => similarity >= this.range)
            .sort((a, b) => {
            if (a.similarity > b.similarity) {
                return -1;
            }
            else if (a.similarity < b.similarity) {
                return 1;
            }
            return 0;
        })
            .find(({ cluster }) => {
            const quantitativeSimilarity = this.calcClustersQuantitativeSimilarity(cluster, item);
            if (quantitativeSimilarity > this._range) {
                return true;
            }
        });
        if (winner) {
            return winner.cluster;
        }
        return null;
    }
    calcClustersQualitativeSimilarity(cluster, item) {
        return item
            .reduce((total, value, index) => total.add(mathjs_1.chain(cluster[index][0]).multiply(item[index]).done()), mathjs_1.chain(0))
            .done();
    }
    calcClustersQuantitativeSimilarity(cluster, item) {
        let itemSum = 0;
        let itemClusterSum = 0;
        item.forEach((value, index) => {
            const longMemory = cluster[index][1];
            itemSum += value;
            itemClusterSum += value * longMemory;
        });
        return mathjs_1.chain(itemClusterSum).divide(itemSum).done();
    }
    createCluster(item) {
        const cluster = [];
        item.forEach((value, index) => {
            const shortMemory = this.calculateShortMemory(item, index);
            cluster[index] = [shortMemory, value];
        });
        return cluster;
    }
    calculateShortMemory(item, index) {
        return mathjs_1.chain(this._lambda)
            .multiply(item[index])
            .divide(mathjs_1.chain(this._lambda)
            .subtract(1)
            .add(item
            .reduce((total, value) => total.add(value), mathjs_1.chain(0))
            .done())
            .done())
            .done();
    }
    recalculateShortMemory(cluster, item, index) {
        const oldShortMemory = cluster[index][0];
        const newShortMemory = mathjs_1.chain(1)
            .subtract(this.speed)
            .multiply(oldShortMemory)
            .add(mathjs_1.chain(this.speed).multiply(this.calculateShortMemory(item, index)).done())
            .done();
        return newShortMemory;
    }
    recalculateLongMemory(cluster, item, index) {
        const oldLongMemory = cluster[index][1];
        const newLongMemory = mathjs_1.chain(1)
            .subtract(this.speed)
            .multiply(oldLongMemory)
            .add(mathjs_1.chain(this.speed).multiply(item[index]).done())
            .done();
        return newLongMemory;
    }
    recalculateCluster(cluster, item) {
        item.forEach((value, index) => {
            cluster[index][0] = this.recalculateShortMemory(cluster, item, index);
            cluster[index][1] = this.recalculateLongMemory(cluster, item, index);
        });
        return cluster;
    }
}
exports.BinaryArrayAdaptiveResonance = BinaryArrayAdaptiveResonance;
//# sourceMappingURL=index.js.map