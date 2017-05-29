/**
 * Take unlimit count of functions and executing them like stack (FIFO).
 * @arguments {Function} Actions
 */
function chain() {
    var functions = [];
    var scope;
    for (var argument in arguments) {
        if (typeof arguments[argument] === "function") {
            functions.push(arguments[argument]);
        } else if (typeof arguments[argument] === "object" && !scope) {
            scope = arguments[argument];
        }
    }

    var counter = -1;
    var next = () => {
        counter++;
        functions[counter].call(scope || this, (counter < functions.length ? next : undefined));
    };
    next();
}

/**
 * Iterates array async
 * @param {Array} data
 * @param {Function} action
 * @param {Function} callback
 */
function forEachAsync(data, action, callback) {
    callback = callback || function () { };
    var counter = -1,
        next = () => {
            setImmediate(() => {
                counter++;
                if (counter < data.length)
                    action(data[counter], next);
                else
                    callback.call(this);
            });
        };
    next();
}

/**
 * Async while
 * @param {Object} config - configurates whileAsync
 * @field {Function} config.preAction - (optional) custom preparing until loop will start
 * @field {Function} config.condition - while's condition. return true/false
 * @field {Function} config.action - iteration's body
 * @field {Function} config.callback - (optional) will launch when config.condition retun false (end of function);
 */
function whileAsync(config) {
    var loop = () => {
        if (config.condition())
            setImmediate(() => {
                config.action(() => {
                    whileAsync(config)
                });
            });
        else if (typeof config.callback === "function")
            config.callback();
    };
    if (typeof config.preAction === "function")
        config.preAction(loop);
    else
        loop();
}

/**
 * launch input functions and synchronize them after all
 * @param {Array} functions
 * @param {Function} callback
 * @param {Object} scope
 */
function launchAsync(functions, callback, scope) {
    scope = scope || this;
    var counter = 0;
    var results = [];
    var end = () => {
        if (counter >= functions.length && typeof callback === "function")
            callback.call(scope, results);
    };
    functions.forEach(func => {
        setImmediate(() => {
            results.push(
                func.call(scope, () => {
                    counter++;
                    end();
                })
            );
        });
    });
}

exports.chain = chain;
exports.forEachAsync = forEachAsync;
exports.whileAsync = whileAsync;
exports.launchAsync = launchAsync;