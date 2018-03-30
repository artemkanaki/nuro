"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euclidean_1 = require("../formulas/euclidean");
const denormalize_1 = require("../formulas/denormalize");
const normalize_1 = require("../formulas/normalize");
const min_max_1 = require("../formulas/min-max");
const clone_1 = require("../helpers/clone");
const exceptions_1 = require("../exceptions");
const math = require("mathjs");
class Kohonen {
    constructor() {
        this._data = [];
        this._normalized = [];
        this._clusters = [];
        this._speed = .5;
        this._delta = -0.05;
        this._range = .6;
        this.denormalizeHelper = new denormalize_1.DenormalizeHelper();
        this.normalizeHelper = new normalize_1.NormalizeHelper();
        this.euclideanHelper = new euclidean_1.EuclideanHelper();
        this.cloneHelper = new clone_1.CloneHelper();
        this.minMaxHelper = new min_max_1.MinMaxHelper();
    }
    get speed() {
        return this._speed;
    }
    set speed(value) {
        this._speed = value;
    }
    get delta() {
        return this._delta;
    }
    set delta(value) {
        this._delta = value;
    }
    get range() {
        return this._range;
    }
    set range(value) {
        this._range = value;
    }
    get iterations() {
        return this._iterations;
    }
    set iterations(value) {
        this._iterations = value;
    }
    get data() {
        return this._data;
    }
    get clusters() {
        return this._clusters;
    }
    setData(items) {
        if (!(items instanceof Array)) {
            throw new exceptions_1.InvalidInputData('argument `items` should be instance of Array');
        }
        else if (!items.length) {
            throw new exceptions_1.InvalidInputData('argument `items` should has at least one element');
        }
        this._data = this.cloneHelper.deepClone(items);
        this._minMax = this.minMaxHelper.getMinMaxFromArray(this.data);
        this._normalized = this.data.map(item => this.normalizeHelper.normalizeArray(item, this._minMax));
    }
    learn() {
        do {
            this.buildClusters();
            this.speed = math.chain(this.speed).add(this.delta).done();
            if (this.iterations) {
                this.iterations--;
            }
        } while (this.speed > 0 && (this.iterations || this.iterations > 0));
        return this._clusters;
    }
    clusterify(item) {
        if (!this.clusters.length) {
            throw new exceptions_1.UnexpectedWorkFlow('Clusters are not prepared yet');
        }
        const normalized = this.normalizeHelper.normalizeArray(item, this._minMax);
        return this.getClosestCluster(normalized);
    }
    setClusterStructure(structure) {
        if (!this._minMax) {
            throw new exceptions_1.UnexpectedWorkFlow('First of all you should fill `data` field');
        }
        this._clusters = structure.map(cluster => this.normalizeHelper.normalizeArray(cluster, this._minMax));
        return this._clusters;
    }
    getDenormalizedClusters() {
        return this._clusters.map(cluster => this.denormalizeHelper.denormalizeArray(cluster, this._minMax));
    }
    buildClusters() {
        if (!this._normalized.length) {
            throw new exceptions_1.InputDataExpected('First of all you should fill `data` field');
        }
        this._normalized.forEach((item, index) => {
            const closestCluster = this.getClosestCluster(item, this.range);
            if (closestCluster) {
                this.recalculateCluster(closestCluster, item);
            }
            else {
                this._clusters.push(item);
            }
        });
        return this._clusters;
    }
    getClosestCluster(item, range) {
        let closestDistance;
        return this._clusters.reduce((closest, candidate) => {
            const candidateDistance = this.euclideanHelper.getEuclideanDistanceFromArray(candidate, item);
            if ((!closest && (!range || candidateDistance <= range))
                || (closest
                    && closestDistance > candidateDistance
                    && (!range || candidateDistance <= range))) {
                closestDistance = candidateDistance;
                return candidate;
            }
            return closest;
        }, null);
    }
    recalculateCluster(cluster, item) {
        for (let index = 0; index < cluster.length; index++) {
            const clusterValue = cluster[index];
            const itemValue = item[index];
            const recalculated = math
                .chain(clusterValue)
                .add(math
                .chain(itemValue)
                .subtract(clusterValue)
                .multiply(this.speed)
                .done())
                .done();
            cluster[index] = recalculated;
        }
        return cluster;
    }
}
exports.Kohonen = Kohonen;
//# sourceMappingURL=index.js.map