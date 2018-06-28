"use strict";
/////////////////////////////////////////////////
// adapted from http://docs.meteor.com/#tracker //
/////////////////////////////////////////////////
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
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
    autorun: function (f, options) {
        if (typeof f !== "function") {
            throw new Error("Tracker.autorun requires a function argument");
        }
        options = options || {};
        var c = new Computation(f, Tracker.currentComputation, options.onError);
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
    function Computation(f, parent, onError) {
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
    function Dependency() {
        this.dependentsById = Object.create(null);
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
        if (!(id in this.dependentsById)) {
            this.dependentsById[id] = computation;
            computation.onInvalidate(function () {
                delete _this.dependentsById[id];
            });
            return true;
        }
        return false;
    };
    Dependency.prototype.changed = function () {
        // tslint:disable-next-line
        for (var id in this.dependentsById) {
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
    Dependency.prototype.waitForNextChange = function (timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var err;
            var _this = this;
            return __generator(this, function (_a) {
                err = new Error("timeout");
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var tm = timeout && setTimeout(function () {
                            reject(err);
                            comp.stop();
                        }, timeout);
                        var comp = autorun(function (icomp) {
                            _this.depend();
                            if (!icomp.firstRun) {
                                if (tm) {
                                    clearTimeout(tm);
                                }
                                resolve();
                                icomp.stop();
                            }
                        });
                    })];
            });
        });
    };
    Dependency.prototype.ignoreNextChanges = function (timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var tm = timeout && setTimeout(function () {
                            comp.stop();
                            resolve();
                        }, timeout);
                        var comp = autorun(function (icomp) {
                            _this.depend();
                        });
                    })];
            });
        });
    };
    Dependency.prototype.rx = function (Component) {
        var dep = this;
        // tslint:disable-next-line:max-classes-per-file
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.componentWillMount = function () {
                var _this = this;
                this.comp = autorun(function () {
                    dep.depend();
                    _this.setState({});
                });
            };
            class_1.prototype.componentWillUnmount = function () {
                if (this.comp) {
                    this.comp.stop();
                }
            };
            class_1.prototype.render = function () {
                return React.createElement(Component, this.props);
            };
            return class_1;
        }(React.Component));
    };
    return Dependency;
}());
exports.Dependency = Dependency;
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
function autorun(f, options) {
    return Tracker.autorun(f, options);
}
exports.autorun = autorun;
function flush() {
    Tracker.flush();
}
exports.flush = flush;
//# sourceMappingURL=tracker.js.map