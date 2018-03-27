"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_1 = require("../../helpers/clone");
const normalize_1 = require("../../formulas/normalize");
const denormalize_1 = require("../../formulas/denormalize");
const min_max_1 = require("../../formulas/min-max");
const mathjs_1 = require("mathjs");
class AnalogAdaptiveResonance {
    constructor() {
        this._clusters = [];
        this._range = .5;
        this._speed = .5;
        this._minMax = [];
        this._normalizedVectors = [];
        this.cloneHelper = new clone_1.CloneHelper();
        this.normalizeHelper = new normalize_1.NormalizeHelper();
        this.denormalizeHelper = new denormalize_1.DenormalizeHelper();
        this.minMaxHelper = new min_max_1.MinMaxHelper();
    }
    get range() {
        return this._range;
    }
    set range(val) {
        this._range = val;
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
    set clusters(val) {
        this._clusters = val;
    }
    learn(data) {
        const normalizedVectors = this.processInputData(data);
        return this.buildClusters(normalizedVectors);
    }
    clusterify(item) {
        return this.learn([item])[0];
    }
    getClosestCluster(item) {
        const vector = this.normalizeHelper.normalizeArray(item, this._minMax);
        const normalizedVector = this.normalizeHelper.getNormalizedVector(vector);
        return this.getClosestClusterForNormalizedVector(normalizedVector);
    }
    processInputData(data) {
        const candidateMinMax = this.minMaxHelper.getMinMaxFromArray(data);
        this.completeMinMax(candidateMinMax);
        const normalizedData = data.map(item => this.normalizeHelper.normalizeArray(item, this._minMax));
        const normalizedVectors = normalizedData.map(vector => this.normalizeHelper.getNormalizedVector(vector));
        this._normalizedVectors.push(...normalizedVectors);
        return normalizedVectors;
    }
    completeMinMax(candidateMinMax) {
        if (this._minMax.length) {
            for (let index = 0; index < this._minMax.length; index++) {
                const existsMinMaxItem = this._minMax[index];
                const candidateMinMaxItem = candidateMinMax[index];
                existsMinMaxItem[0] = existsMinMaxItem[0] > candidateMinMaxItem[0] ? candidateMinMaxItem[0] : existsMinMaxItem[0];
                existsMinMaxItem[1] = existsMinMaxItem[1] < candidateMinMaxItem[1] ? candidateMinMaxItem[1] : existsMinMaxItem[1];
            }
        }
        else {
            this._minMax = candidateMinMax;
        }
        return this._minMax;
    }
    buildClusters(vectors) {
        vectors.map(vector => {
            const closestCluster = this.getClosestClusterForNormalizedVector(vector);
            if (closestCluster) {
                this.recalculateCluster(closestCluster, vector);
            }
            else {
                this.clusters.push(vector);
            }
        });
        return this.clusters;
    }
    getClosestClusterForNormalizedVector(vector) {
        let closestSimilarity;
        const closestCluster = this.clusters.reduce((closest, candidate) => {
            let total = mathjs_1.chain(0);
            for (let index = 0; index < vector.length; index++) {
                total = total.add(mathjs_1.chain(candidate[index]).multiply(vector[index]).done());
            }
            const totalNumber = total.done();
            if ((!closestSimilarity && totalNumber >= this.range) || (totalNumber > closestSimilarity)) {
                closestSimilarity = totalNumber;
                return candidate;
            }
            return closest;
        }, null);
        return closestCluster;
    }
    recalculateCluster(cluster, vector) {
        for (let index = 0; index < cluster.length; index++) {
            cluster[index] = mathjs_1.chain(1)
                .subtract(this.speed)
                .multiply(cluster[index])
                .add(mathjs_1.chain(this.speed)
                .multiply(vector[index])
                .done())
                .done();
        }
        return cluster;
    }
}
exports.AnalogAdaptiveResonance = AnalogAdaptiveResonance;
//# sourceMappingURL=index.js.map