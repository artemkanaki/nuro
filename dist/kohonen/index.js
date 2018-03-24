"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const euclidean_1 = require("../formulas/euclidean");
const denormalize_1 = require("../formulas/denormalize");
const normalize_1 = require("../formulas/normalize");
const exceptions_1 = require("../exceptions");
const clone_1 = require("../helpers/clone");
const lodash_1 = require("lodash");
const min_max_1 = require("../formulas/min-max");
const math = require("mathjs");
var KohonenType;
(function (KohonenType) {
    KohonenType[KohonenType["SELF_ORGANIZE"] = 1] = "SELF_ORGANIZE";
    KohonenType[KohonenType["SELF_STUDY"] = 2] = "SELF_STUDY";
})(KohonenType = exports.KohonenType || (exports.KohonenType = {}));
class Kohonen {
    constructor() {
        this._data = [];
        this._normalized = [];
        this._clusters = [];
        this._speed = 0.5;
        this._delta = -0.05;
        this.denormalizeHelper = new denormalize_1.default();
        this.normalizeHelper = new normalize_1.default();
        this.euclideanHelper = new euclidean_1.default();
        this.cloneHelper = new clone_1.default();
        this.minMaxHelper = new min_max_1.default();
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
    setData(value) {
        this._data = this.cloneHelper.deepClone(value);
        const isExtended = !!Object.keys(this._data[0]).find(key => {
            const extended = !!this._data.find(item => lodash_1.get(item, key) < 0);
            return extended;
        });
        this._minMax = this.minMaxHelper.getMinMaxConfig(this.data);
        this._normalized = this._data.map(item => this.normalizeHelper.normalizeObject(item, this._minMax));
    }
    learn(range) {
        do {
            this.buildClusters(range);
            this.speed = math.chain(this.speed).add(this.delta).done();
            this.iterations--;
        } while (this.speed > 0 && (this.iterations || this.iterations > 0));
        return this._clusters;
    }
    buildClusters(range) {
        if (!this._normalized.length) {
            throw new exceptions_1.InputDataExpected('First of all you should fill `data` field');
        }
        this._normalized.forEach((item, index) => {
            const closestCluster = this.getClosestCluster(item, range);
            if (closestCluster) {
                this.recalculateCluster(closestCluster, item);
            }
            else {
                this._clusters.push(item);
            }
        });
        return this._clusters;
    }
    clusterify(item) {
        const normalized = this.normalizeHelper.normalizeObject(item, this._minMax);
        return this.getClosestCluster(normalized);
    }
    getClosestCluster(item, range) {
        let closestDistance;
        return this._clusters.reduce((closest, candidate) => {
            const candidateDistance = this.euclideanHelper.getEuclideanDistance(candidate, item);
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
        Object.keys(cluster).forEach(key => {
            const clusterPropValue = lodash_1.get(cluster, key);
            const recalculated = math
                .chain(clusterPropValue)
                .add(math
                .chain(lodash_1.get(item, key))
                .subtract(clusterPropValue)
                .multiply(this.speed)
                .done())
                .done();
            lodash_1.set(cluster, key, recalculated);
        });
        return cluster;
    }
    setClusterStructure(structure) {
        if (!this._minMax) {
            throw new exceptions_1.UnexpectedWorkFlow('First of all you should fill `data` field');
        }
        this._clusters = structure.map(cluster => this.normalizeHelper.normalizeObject(cluster, this._minMax));
        return this._clusters;
    }
    getDenormalizedClusters() {
        return this._clusters.map(cluster => this.denormalizeHelper.denormalizeObject(cluster, this._minMax));
    }
}
exports.Kohonen = Kohonen;
//# sourceMappingURL=index.js.map