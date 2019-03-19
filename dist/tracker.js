"use strict";
/////////////////////////////////////////////////
// adapted from http://docs.meteor.com/#tracker //
/////////////////////////////////////////////////
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("@hoda5/extensions");
var h5debug_1 = require("@hoda5/h5debug");
// tslint:disable-next-line:variable-name
var Tracker = {
    active: false,
    currentComputation: null,
    flush: function () {
        Tracker._runFlush({
            finishSynchronously: true,
        });
    },
    inFlush: function () {
        return inFlush;
    },
    _runFlush: function (options) {
        if (Tracker.inFlush()) {
            throw new Error("Can't call Tracker.flush while flushing");
        }
        if (inCompute) {
            throw new Error("Can't flush inside Tracker.autorun");
        }
        options = options || {};
        inFlush = true;
        willFlush = true;
        var recomputedCount = 0;
        var finishedTry = false;
        try {
            while (pendingComputations.length ||
                afterFlushCallbacks.length) {
                while (pendingComputations.length) {
                    var comp = pendingComputations.shift();
                    if (comp) {
                        comp._recompute();
                        if (comp._needsRecompute()) {
                            pendingComputations.unshift(comp);
                        }
                    }
                    if (!options.finishSynchronously && ++recomputedCount > 1000) {
                        finishedTry = true;
                        return;
                    }
                }
                if (afterFlushCallbacks.length) {
                    var func = afterFlushCallbacks.shift();
                    if (func) {
                        try {
                            func();
                        }
                        catch (e) {
                            //
                        }
                    }
                }
            }
            finishedTry = true;
        }
        finally {
            if (!finishedTry) {
                inFlush = false;
                Tracker._runFlush({
                    finishSynchronously: options.finishSynchronously,
                });
            }
            willFlush = false;
            inFlush = false;
            if (pendingComputations.length || afterFlushCallbacks.length) {
                if (options.finishSynchronously) {
                    // tslint:disable-next-line
                    throw new Error("still have more to do?"); // shouldn't happen
                }
                setTimeout(requireFlush, 10);
            }
        }
    },
    autorun: function (h5debugname, f, options) {
        if (typeof f !== "function") {
            throw new Error("Tracker.autorun requires a function argument");
        }
        options = options || {};
        var c = new Computation(h5debugname, f, Tracker.currentComputation, options.onError);
        if (Tracker.active) {
            Tracker.onInvalidate(function () {
                c.stop();
            });
        }
        return c;
    },
    nonreactive: function (f) {
        var previous = Tracker.currentComputation;
        setCurrentComputation(null);
        try {
            return f();
        }
        finally {
            setCurrentComputation(previous);
        }
    },
    onInvalidate: function (f) {
        if (!Tracker.active) {
            throw new Error("Tracker.onInvalidate requires a currentComputation");
        }
        Tracker.currentComputation.onInvalidate(f);
    },
    afterFlush: function (f) {
        afterFlushCallbacks.push(f);
        requireFlush();
    },
};
var nextId = 1;
var pendingComputations = [];
var willFlush = false;
var inFlush = false;
var inCompute = false;
var afterFlushCallbacks = [];
function setCurrentComputation(c) {
    Tracker.currentComputation = c;
    Tracker.active = !!c;
}
function requireFlush() {
    if (!willFlush) {
        // eslint-disable-next-line
        setTimeout(Tracker._runFlush, 0);
        willFlush = true;
    }
}
var Computation = /** @class */ (function () {
    function Computation(h5debugname, f, parent, onError) {
        this.h5debugname = h5debugname;
        if (h5debug_1.h5debug["@hoda5/tracker"]) {
            if (typeof h5debugname !== "string")
                throw new Error("autorun precisa de um nome");
        }
        this.stopped = false;
        this.invalidated = false;
        this.firstRun = true;
        this.id = nextId++;
        this.onInvalidateCallbacks = [];
        this.onStopCallbacks = [];
        this.parent = parent;
        this.func = f;
        this.onError = onError;
        this.recomputing = false;
        var errored = true;
        try {
            this._compute();
            errored = false;
        }
        finally {
            this.firstRun = false;
            if (errored) {
                this.stop();
            }
        }
    }
    Computation.prototype.onInvalidate = function (f) {
        var _this = this;
        if (typeof f !== "function") {
            throw new Error("onInvalidate requires a function");
        }
        if (this.invalidated) {
            Tracker.nonreactive(function () { return f(_this); });
        }
        else {
            this.onInvalidateCallbacks.push(f);
        }
    };
    Computation.prototype.onStop = function (f) {
        var _this = this;
        if (typeof f !== "function") {
            throw new Error("onStop requires a function");
        }
        if (this.stopped) {
            Tracker.nonreactive(function () { return f(_this); });
        }
        else {
            this.onStopCallbacks.push(f);
        }
    };
    Computation.prototype.invalidate = function () {
        var _this = this;
        if (!this.invalidated) {
            if (!this.recomputing && !this.stopped) {
                requireFlush();
                pendingComputations.push(this);
            }
            this.invalidated = true;
            var _loop_1 = function (i, f) {
                Tracker.nonreactive(function () { return f(_this); });
            };
            // tslint:disable-next-line
            for (var i = 0, f = void 0; f = this.onInvalidateCallbacks[i]; i++) {
                _loop_1(i, f);
            }
            this.onInvalidateCallbacks = [];
        }
    };
    Computation.prototype.stop = function () {
        var _this = this;
        if (!this.stopped) {
            this.stopped = true;
            this.invalidate();
            var _loop_2 = function (i, f) {
                Tracker.nonreactive(function () { return f(_this); });
            };
            // tslint:disable-next-line
            for (var i = 0, f = void 0; f = this.onStopCallbacks[i]; i++) {
                _loop_2(i, f);
            }
            this.onStopCallbacks = [];
        }
    };
    Computation.prototype._compute = function () {
        this.invalidated = false;
        var previous = Tracker.currentComputation;
        setCurrentComputation(this);
        var previousInCompute = inCompute;
        inCompute = true;
        try {
            this.func(this);
        }
        finally {
            setCurrentComputation(previous);
            inCompute = previousInCompute;
        }
    };
    Computation.prototype._needsRecompute = function () {
        return this.invalidated && !this.stopped;
    };
    Computation.prototype._recompute = function () {
        this.recomputing = true;
        try {
            if (this._needsRecompute()) {
                try {
                    this._compute();
                }
                catch (e) {
                    if (this.onError) {
                        this.onError(e);
                    }
                }
            }
        }
        finally {
            this.recomputing = false;
        }
    };
    Computation.prototype.flush = function () {
        if (this.recomputing) {
            return;
        }
        this._recompute();
    };
    Computation.prototype.run = function () {
        this.invalidate();
        this.flush();
    };
    return Computation;
}());
exports.Computation = Computation;
// tslint:disable-next-line
var Dependency = /** @class */ (function () {
    function Dependency(h5debugname, initialvalue) {
        this.dependentsById = Object.create(null);
        this.h5debugname = h5debugname;
        if (initialvalue)
            this._value = initialvalue;
        if (h5debug_1.h5debug["@hoda5/tracker"]) {
            if (typeof h5debugname !== "string")
                throw new Error("Dependency precisa de um nome");
        }
    }
    Dependency.prototype.depend = function (computation) {
        var _this = this;
        if (!computation) {
            if (!Tracker.active) {
                return false;
            }
            computation = Tracker.currentComputation;
        }
        var id = computation.id;
        if (h5debug_1.h5debug["@hoda5/tracker"]) {
            h5debug_1.h5debug["@hoda5/tracker"](this.h5debugname, ".depend() on ", computation.h5debugname);
        }
        if (!(id in this.dependentsById)) {
            this.dependentsById[id] = computation;
            computation.onInvalidate(function () {
                delete _this.dependentsById[id];
            });
            return true;
        }
        return false;
    };
    Object.defineProperty(Dependency.prototype, "value", {
        get: function () {
            this.depend();
            return this._value;
        },
        set: function (value) {
            // if (Object.prototype.compareObj.call((this as any)._value, value) !== 0) {
            this._value = value;
            this.changed();
            // }
        },
        enumerable: true,
        configurable: true
    });
    Dependency.prototype.changed = function () {
        // tslint:disable-next-line
        for (var id in this.dependentsById) {
            if (h5debug_1.h5debug["@hoda5/tracker"]) {
                var computation = this.dependentsById[id];
                h5debug_1.h5debug["@hoda5/tracker"](this.h5debugname, ".changed() invalidating ", computation.h5debugname);
            }
            this.dependentsById[id].invalidate();
        }
    };
    Dependency.prototype.hasDependents = function () {
        // tslint:disable-next-line
        for (var id in this.dependentsById) {
            return id !== undefined;
        }
        return false;
    };
    Dependency.prototype.waitForNextChange = function (a, b) {
        var _this = this;
        var condition = typeof a === "function" ? a : undefined;
        var timeout = condition ? b : a;
        var err = new Error("timeout");
        return new Promise(function (resolve, reject) {
            var tm = timeout && setTimeout(function () {
                reject(err);
                comp.stop();
            }, timeout);
            var comp = autorun(_this.h5debugname + ".waitForNextChange", function (icomp) {
                _this.depend();
                if (!icomp.firstRun) {
                    if (tm) {
                        clearTimeout(tm);
                    }
                    if (condition && (!condition()))
                        return;
                    resolve();
                    icomp.stop();
                }
            });
        });
    };
    Dependency.prototype.ignoreNextChanges = function (timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var tm = timeout && setTimeout(function () {
                comp.stop();
                resolve();
            }, timeout);
            var comp = autorun(_this.h5debugname + ".ignoreNextChanges", function (icomp) {
                _this.depend();
            });
        });
    };
    return Dependency;
}());
exports.Dependency = Dependency;
function reactProvider(h5debugname, Component, dependencies) {
    var depProv = new Dependency(h5debugname);
    // tslint:disable-next-line:max-classes-per-file
    var ReactProviderComp = /** @class */ (function (_super) {
        __extends(ReactProviderComp, _super);
        function ReactProviderComp() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ReactProviderComp.prototype.componentWillMount = function () {
            var _this = this;
            this.comp = autorun(h5debugname + ".rx", function (c) {
                depProv.depend();
                dependencies.forEach(function (dep) { return dep.depend(); });
                if (!c.firstRun)
                    nonreactive(function () { return _this.setState({}); });
            });
        };
        ReactProviderComp.prototype.componentWillUnmount = function () {
            if (this.comp)
                this.comp.stop();
        };
        ReactProviderComp.prototype.render = function () {
            return React.createElement(ErrorBoundary, null, React.createElement(Component));
        };
        return ReactProviderComp;
    }(React.Component));
    return {
        dependencies: {
            get list() {
                depProv.depend();
                return dependencies;
            },
            add: function (dependency) {
                var i = dependencies.indexOf(dependency);
                if (i === -1) {
                    dependencies.push(dependency);
                    depProv.changed();
                }
            },
            remove: function (dependency) {
                var i = dependencies.indexOf(dependency);
                if (i !== -1) {
                    dependencies.splice(i, 1);
                    depProv.changed();
                }
            },
        },
        render: ReactProviderComp,
    };
}
exports.reactProvider = reactProvider;
/**
 * @callback Tracker.ComputationFunction
 * @param {Tracker.Computation}
 */
/**
 * @summary Run a function now and rerun it later whenever its dependencies
 * change. Returns a Computation object that can be used to stop or observe the
 * rerunning.
 * @locus Client
 * @param {Tracker.ComputationFunction} runFunc The function to run. It receives
 * one argument: the Computation object that will be returned.
 * @param {Object} [options]
 * @param {Function} options.onError Optional. The function to run when an error
 * happens in the Computation. The only argument it receives is the Error
 * thrown. Defaults to the error being logged to the console.
 * @returns {Tracker.Computation}
 */
function autorun(h5debugname, f, options) {
    return Tracker.autorun(h5debugname, f, options);
}
exports.autorun = autorun;
function flush() {
    Tracker.flush();
}
exports.flush = flush;
function nonreactive(f) {
    return Tracker.nonreactive(f);
}
exports.nonreactive = nonreactive;
function afterFlush(f) {
    return Tracker.afterFlush(f);
}
exports.afterFlush = afterFlush;
// tslint:disable-next-line:max-classes-per-file
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hasError: false };
        return _this;
    }
    ErrorBoundary.prototype.componentDidCatch = function (error, info) {
        this.setState({
            hasError: JSON.stringify({
                info: info,
                error: error.stack ? error.stack.toString() : error.message,
            }, null, 2).replace(/\\n/g, "\n"),
        });
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError)
            return React.createElement("pre", null, this.state.hasError);
        return this.props.children;
    };
    return ErrorBoundary;
}(React.Component));
//# sourceMappingURL=tracker.js.map