// config.schemaMap = { input: [], output: [] }
// config.data = {}

// clusters.schemaMap = { input: [], output: [] }
// clusters.data = {}
// clusters.method = method(enum);
var async = require('./lib/asyncHelper'),
    Method = {
        UNSCALE: 0,
        SCALE: 1
    };
function getNeuralWrapper(config) {
    return cb => {
        (config.schemaMap.output ? unscaleLayer : scaleLayer)(config, cb);
    }
}

// TODO: Make scale layer
function scaleLayer() {

}

function unscaleLayer(config, cb) {
    prepareClusters(config.schemaMap, config.data, clusters => {
        unscaleLearn.call(this, clusters, config, cb);
    });
}
function prepareClusters(schemaMap, data, cb) {
    var clusters = initClusters();
    async.chain(
        next => {
            cloneData(clusters, data, () => {
                next();
            });
        },
        next => {
            cloneMap(clusters, schemaMap, () => {
                next();
            });
        },
        () => {
            clustersFormation(clusters, () => {
                cb(clusters);
            });
        }
    )
}
function keepProperties(obj, properties) {
    var newObj = {};
    for (var property in obj)
        if (~properties.indexOf(property))
            newObj[property] = obj[property];
    return newObj;
}
function removeProperties(obj, properties) {
    var newObj = {};
    for (var property in obj)
        if (!~properties.indexOf(property))
            newObj[property] = obj[property];
    return newObj;
}
function compare(first, second) {
    var equal = true;
    getObjFields(first).forEach(field =>
        equal = !equal ? equal : second.hasOwnProperty(field) && second[field] === first[field]);
    if (!equal)
        return equal;
    getObjFields(second).forEach(field =>
        equal = !equal ? equal : first.hasOwnProperty(field) && first[field] === second[field]);
    return equal;
}
function clone(item, callback) {
    var itemClone = {};
    setImmediate(() => {
        for (attr in item) {
            itemClone[attr] = item[attr];
        }
        callback(itemClone);
    });
}
function getObjFields(obj) {
    var fields = [];
    for (var field in obj)
        fields.push(field);
    return fields;
}
function initClusters() {
    return {
        schemaMap: { input: [], output: [] },
        data: []
    };
}
function cloneData(clusters, data, cb) {
    async.forEachAsync(data, (item, next) => {
        clone(item, clone => {
            clusters.data.push(clone);
            next();
        });
    }, () => {
        cb(clusters);
    });
}
function cloneMap(clusters, map, cb) {
    setImmediate(() => {
        clusters.schemaMap.input = map.input.slice();
        clusters.schemaMap.output = map.output.slice();
        cb(clusters);
    });
}
function clustersFormation(clusters, cb) {
    var data = [];
    clusterFormationIteration(clusters, data, () => {
        clusters.data = data;
        cb();
    })
}
function clusterFormationIteration(clusters, data, cb) {
    setImmediate(() => {
        var outputTemplate = keepProperties(clusters.data[0], clusters.schemaMap.output);
        sliceClustersByOutput(clusters.data, outputTemplate, (sliced, newData) => {
            var length = sliced.length;
            clusters.data = newData;
            compressArrayIntoObj(sliced, clusters.schemaMap.input, obj => {
                clusters.schemaMap.input.forEach(field => {
                    obj[field] /= length;
                });
                interlockObj(obj, outputTemplate, interlocked => {
                    data.push(interlocked);
                    if (clusters.data.length)
                        clusterFormationIteration(clusters, data, cb);
                    else
                        cb();
                });
            });
        });
    })
}
function sliceClustersByOutput(clusters, output, cb) {
    var outputFields = getObjFields(output),
        sliced = clusters.filter(cluster => {
            var willSlice = true;
            outputFields.forEach(field => {
                willSlice = !willSlice ? willSlice : cluster[field] === output[field];
            });
            return willSlice;
        });
    clusters = clusters.filter(cluster => !~sliced.indexOf(cluster));
    cb(sliced, clusters);
}
function compressArrayIntoObj(array, fieldsMap, cb) {
    var obj = {};
    fieldsMap.forEach(field => {
        (() => {
            setImmediate(() => {
                obj[field] = array.map(item => item[field]).reduce((prev, curr) => {
                    return curr + prev;
                }, 0);
                if (getObjFields(obj).length === fieldsMap.length)
                    cb(obj);
            });
        })(field);
    })

}
function interlockObj(first, second, cb) {
    var obj = {}
    for (var field in first)
        obj[field] = first[field];
    for (var field in second)
        obj[field] = second[field];
    cb(obj);
}

function unscaleLearn(clusters, config, cb) {
    var speed = config.speed || 0.5,
        delta = config.delta || -0.05,
        iterations = config.iterations,
        data = config.data;

    speed -= delta;
    iterations = iterations ? iterations + 1 : iterations;
    async.whileAsync({
        preAction: loop => {
            speed += delta;
            if (iterations !== undefined) {
                iterations--;
            }
            loop();
        },
        condition: () => {
            return speed >= 0 && (iterations !== undefined ? iterations : 1) > 0;
        },
        action: nextLoop => {
            unscaleIteration(clusters, data, speed, () => {

                nextLoop();
            });
        },
        callback: () => {
            clusters.method = Method.UNSCALE;
            cb(null, clusters);
        }
    });
}
function unscaleIteration(clusters, data, speed, cb) {
    async.forEachAsync(data, (item, next) => {
        getClosestCluster(clusters, item, cluster => {
            var indexOfOldCluster = clusters.data.indexOf(cluster);
            recalculateClusterAttributes(clusters.data, cluster, clusters.schemaMap.input, item, speed, cluster => {
                clusters.data.splice(indexOfOldCluster, 1, cluster);
                next();
            });
        });
    }, () => {
        cb();
    });
}
function getClosestCluster(clusters, item, cb) {
    var winnerConfig = {};
    async.forEachAsync(clusters.data, (cluster, next) => {
        wrapperConfig = {
            first: cluster,
            second: item,
            keepFields: clusters.schemaMap.input,
            cb: distance => {
                if (!winnerConfig.cluster || !winnerConfig.distance) {
                    winnerConfig.cluster = cluster;
                    winnerConfig.distance = distance;
                }
                if (winnerConfig.distance > distance) {
                    winnerConfig.distance = distance;
                    winnerConfig.cluster = cluster;
                }
                next();
            }
        }
        euclideanDistanceWrapper(wrapperConfig);
    }, () => {
        cb(winnerConfig.cluster, winnerConfig.distance);
    });
}
function recalculateClusterAttributes(clusters, cluster, fieldMap, shiftConfig, speed, cb) {
    setImmediate(() => {
        var indexOfOldCluster = clusters.indexOf(cluster);
        fieldMap.forEach(field => {
            cluster[field] = cluster[field] + speed * (shiftConfig[field] - cluster[field]);
        });
        clusters.splice(indexOfOldCluster, 1, cluster);
        cb(cluster);
    });
}

function euclideanDistanceWrapper(config) {
    var first = config.first,
        second = config.second;
    if (config.keepFields) {
        first = keepProperties(first, config.keepFields);
        second = keepProperties(second, config.keepFields);
    }

    getEuclideanDistance(first, second, config.cb);
}
function getEuclideanDistance(first, second, callback) {
    setImmediate(() => {
        var distance = Math.sqrt(getObjFields(first)
            .map(field => {
                return Math.pow(first[field] - second[field], 2);
            })
            .reduce((prev, curr) => {
                return prev + curr;
            }, 0));
        callback(distance);
    });
}

function run(clusters, data, cb) {
    if (clusters.method === Method.UNSCALE)
        unscaleRun(clusters, data, cb);
    else if (clusters.method === Method.SCALE)
        cb(null, null);
}
function unscaleRun(clusters, data, cb) {
    var modifyData = [];
    data.forEach(item => {
        (() => {
            setImmediate(() => {
                getClosestCluster(clusters, item, cluster => {
                    cluster = removeProperties(cluster, clusters.schemaMap.input);
                    interlockObj(item, cluster, interocked => {
                        modifyData.push(interocked);
                        //data.slice(data.indexOf(item), 1, interocked);
                        if (modifyData.length === data.length)
                            cb(null, modifyData);
                    });
                });
            })
        })(item)
    });
}


// Normalization
function normalizeStd(min, max, target, callback) {
    setImmediate(() => {
        callback((target - min) / (max - min))
    });
}
function normalizeIncludingNegativeOne(min, max, target, callback) {
    setImmediate(() => {
        callback(2 * ((target - min) / (max - min)) - 1)
    });
}
function normalizeObj(minMax, obj, callback) {
    setImmediate(() => {
        var normalizers = [];
        for (var field in minMax) {
            var fieldNormalizer = (normalizer, min, max, objecToNormalize, fieldName) => {
                return end => {
                    normalizer(min, max, objecToNormalize[fieldName], value => {
                        objecToNormalize[fieldName] = value;
                        end();
                    });
                };
            };
            var normalizer = minMax[field].min >= 0 ? normalizeStd : normalizeIncludingNegativeOne;
            normalizers.push(
                fieldNormalizer(normalizer, minMax[field].min, minMax[field].max, obj, field));
        }
        async.launchAsync(normalizers, () => {
            callback(obj);
        });
    });
}

function denormalizeStd(min, max, target, callback) {
    setImmediate(() => {
        callback((target * (max - min)) + min);
    });
}
function denormalizeIncludingNegativeOne(min, max, target, callback) {
    setImmediate(() => {
        callback((target - 1) * 2 * (max - min) - min);
    });
}
function denormalizeObj(minMax, obj, callback) {
    setImmediate(() => {
        var denormalizers = [];
        for (var field in obj) {
            var fieldDenormalizer = (denormalizer, min, max, objecToDenormalize, fieldName) => {
                return end => {
                    denormalizer(min, max, objecToDenormalize[fieldName], value => {
                        objecToDenormalize[fieldName] = value;
                        end();
                    });
                };
            };
            var denormalizer = minMax[field].min >= 0 ? denormalizeStd : denormalizeIncludingNegativeOne;
            denormalizers.push(
                fieldDenormalizer(denormalizer, minMax[field].min, minMax[field].max, obj, field));
        }
        async.launchAsync(denormalizers, () => {
            callback(obj);
        });
    });
}

function normalizeData (data, minMax, cb) {
    setImmediate(() => {
        var dataClone = [],
            cloningData = cloneArrayInChain(data, dataClone),
            normalizeFn = normalizeArrayInChain(dataClone, minMax);

        async.chain(
            cloningData,
            normalizeFn,
            () => {
                cb(null, dataClone);
            }
        );
    });
}
function cloneArrayInChain(array, arrayClone) {
    return next => {
        async.forEachAsync(array,
            (item, next) => {
                clone(item, clone => {
                    arrayClone.push(clone);
                    next();
                });
            },
            () => {
                next();
            }
        );
    }
}
function normalizeArrayInChain(array, minMax) {
    return next => {
        async.forEachAsync(array,
            (item, next) => {
                var index = array.indexOf(item);
                normalizeObj(minMax, item, normalized => {
                    array.slice(index, 1, normalized);
                    next();
                });
            },
            () => {
                next();
            }
        );
    }
}

function denormalizeData(data, minMax, cb) {
    setImmediate(() => {
        var dataClone = [],
            cloningData = cloneArrayInChain(data, dataClone),
            denormalizeFn = denormalizeArrayInChain(dataClone, minMax);

        async.chain(
            cloningData,
            denormalizeFn,
            () => {
                cb(null, dataClone);
            }
        );
    });
}
function denormalizeArrayInChain(array, minMax) {
    return next => {
        async.forEachAsync(array,
            (item, next) => {
                var index = array.indexOf(item);
                denormalizeObj(minMax, item, denormalized => {
                    array.slice(index, 1, denormalized);
                    next();
                });
            },
            () => {
                next();
            }
        );
    }
}

function getMinMaxConfig (data, cb) {
    var fields = getObjFields(data[0]),
        minMax = {};
    async.forEachAsync(fields, (field, next) => {
        minMax[field] = minMaxInArray(data.map(item => item[field]).filter(item => !!item || item === 0));
        next();
    }, () => {
        cb(null, minMax);
    });
};
function minMaxInArray(array) {
    return {
        min: minInArray(array),
        max: maxInArray(array)
    }
}
function minInArray(array) {
    return Math.min.apply(null, array);
}
function maxInArray(array) {
    return Math.max.apply(null, array);
}

function prepareData(data, cb) {
    getMinMaxConfig(data, (err, config) => {
        if (err) {
            cb(err);
            return;
        }
        normalizeData(data, config, cb);
    });
}
function prepareDataAndStartLearning(config, cb) {
    var configClone = {};
    for (var parameter in config)
        configClone[parameter] = config[parameter];

    prepareData(configClone.data, (err, normalized) => {
        if (err) {
            cb(err);
            return;
        }
        configClone.data = normalized;
        var wrapper = getNeuralWrapper(configClone);
        wrapper((err, clusters) => {
            cb(err, clusters, normalized);
        });
    });
}
function clearDataFromAnomalies(data, schemaMap, cb) {
    var clearData = [];
    async.forEachAsync(data, (item, next) => {
        var valid = true;
        schemaMap.input.concat(schemaMap.output).forEach(field => {
            valid = !valid ? valid : !isEmpty(item[field])
        });
        if (valid)
            clearData.push(item);
        next();
    }, () => {
        cb(null, clearData);
    });
}

function isEmpty(obj) {
    return obj === null || obj === undefined || (typeof obj === "number" && isNaN(obj))
}

exports.getNeuralWrapper = getNeuralWrapper;
exports.run = run;
exports.getMinMaxConfig = getMinMaxConfig;
exports.normalizeData = normalizeData;
exports.prepareData = prepareData;
exports.prepareDataAndStartLearning = prepareDataAndStartLearning;
exports.denormalizeData = denormalizeData;
exports.clearDataFromAnomalies = clearDataFromAnomalies;