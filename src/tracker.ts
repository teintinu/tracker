/////////////////////////////////////////////////
// adapted from http://docs.meteor.com/#tracker //
/////////////////////////////////////////////////

export type RunOptions = {
    finishSynchronously?: boolean
}
export type ComputationOptions = {
    onError?: (error: Error) => void;
}

const Tracker = {
    active: false,
    currentComputation: null as any as Computation,
    flush() {
        Tracker._runFlush({
            finishSynchronously: true
        });
    },
    inFlush() {
        return inFlush;
    },
    _runFlush(options: RunOptions) {
        if (Tracker.inFlush())
            throw new Error("Can't call Tracker.flush while flushing");

        if (inCompute)
            throw new Error("Can't flush inside Tracker.autorun");

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
                    if (func)
                        try {
                            func();
                        } catch (e) {
                            //
                        }
                }
            }
            finishedTry = true;
        } finally {
            if (!finishedTry) {
                inFlush = false;
                Tracker._runFlush({
                    finishSynchronously: options.finishSynchronously
                });
            }
            willFlush = false;
            inFlush = false;
            if (pendingComputations.length || afterFlushCallbacks.length) {
                if (options.finishSynchronously) {
                    //eslint-disable-next-line
                    throw new Error("still have more to do?");  // shouldn't happen
                }
                //eslint-disable-next-line
                setTimeout(requireFlush, 10);
            }
        }
    },
    autorun(f: (comp: Computation) => void, options?: ComputationOptions) {
        if (typeof f !== 'function')
            throw new Error('Tracker.autorun requires a function argument');

        options = options || {};

        var c = new Computation(
            f, Tracker.currentComputation, options.onError);

        if (Tracker.active)
            Tracker.onInvalidate(function () {
                c.stop();
            });

        return c;
    },
    nonreactive(f: () => void) {
        var previous = Tracker.currentComputation;
        setCurrentComputation(null as any);
        try {
            return f();
        } finally {
            setCurrentComputation(previous);
        }
    },
    onInvalidate(f: () => void) {
        if (!Tracker.active)
            throw new Error("Tracker.onInvalidate requires a currentComputation");

        Tracker.currentComputation.onInvalidate(f);
    },
    afterFlush(f: () => void) {
        afterFlushCallbacks.push(f);
        requireFlush();
    },
};


let nextId = 1;
let pendingComputations: Computation[] = [];
let willFlush = false;
let inFlush = false;
let inCompute = false;
let afterFlushCallbacks: Array<() => void> = [];

function setCurrentComputation(c: Computation) {
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

export class Computation {
    stopped: boolean;
    invalidated: boolean;
    firstRun: boolean;
    _id: number
    _onInvalidateCallbacks: Array<(comp: Computation) => void>;
    _onStopCallbacks: Array<(comp: Computation) => void>;
    _parent: Computation;
    _func: (comp: Computation) => void;
    _onError?: (error: Error) => void;
    _recomputing: boolean;

    constructor(f: (comp: Computation) => void, parent: Computation, onError?: (error: Error) => void) {
        this.stopped = false;
        this.invalidated = false;
        this.firstRun = true;

        this._id = nextId++;
        this._onInvalidateCallbacks = [];
        this._onStopCallbacks = [];
        this._parent = parent;
        this._func = f;
        this._onError = onError;
        this._recomputing = false;

        var errored = true;
        try {
            this._compute();
            errored = false;
        } finally {
            this.firstRun = false;
            if (errored)
                this.stop();
        }
    }

    onInvalidate(f: (comp: Computation) => void) {
        if (typeof f !== 'function')
            throw new Error("onInvalidate requires a function");

        if (this.invalidated) {
            Tracker.nonreactive(() => f(this));
        } else {
            this._onInvalidateCallbacks.push(f);
        }
    }

    onStop(f: (comp: Computation) => void) {
        if (typeof f !== 'function')
            throw new Error("onStop requires a function");

        if (this.stopped) {
            Tracker.nonreactive(() => f(this));
        } else {
            this._onStopCallbacks.push(f);
        }
    }

    invalidate() {
        if (!this.invalidated) {
            if (!this._recomputing && !this.stopped) {
                requireFlush();
                pendingComputations.push(this);
            }

            this.invalidated = true;
            //eslint-disable-next-line
            for (var i = 0, f: (comp: Computation) => void; f = this._onInvalidateCallbacks[i]; i++) {
                Tracker.nonreactive(() => f(this));
            }
            this._onInvalidateCallbacks = [];
        }
    }

    stop() {
        if (!this.stopped) {
            this.stopped = true;
            this.invalidate();
            //eslint-disable-next-line
            for (var i = 0, f: (comp: Computation) => void; f = this._onStopCallbacks[i]; i++) {
                Tracker.nonreactive(() => f(this));
            }
            this._onStopCallbacks = [];
        }
    }

    _compute() {
        this.invalidated = false;

        var previous = Tracker.currentComputation;
        setCurrentComputation(this);
        var previousInCompute = inCompute;
        inCompute = true;
        try {
            this._func(this);
        } finally {
            setCurrentComputation(previous);
            inCompute = previousInCompute;
        }
    }

    _needsRecompute() {
        return this.invalidated && !this.stopped;
    }

    _recompute() {
        this._recomputing = true;
        try {
            if (this._needsRecompute()) {
                try {
                    this._compute();
                } catch (e) {
                    if (this._onError) {
                        this._onError(e);
                    }
                }
            }
        } finally {
            this._recomputing = false;
        }
    }

    flush() {
        if (this._recomputing)
            return;

        this._recompute();
    }

    run() {
        this.invalidate();
        this.flush();
    }
}

export class Dependency {
    _dependentsById: { [name: string]: Computation }
    constructor() {
        this._dependentsById = Object.create(null);
    }

    depend(computation?: Computation) {
        if (!computation) {
            if (!Tracker.active)
                return false;

            computation = Tracker.currentComputation;
        }
        var id = computation._id;
        if (!(id in this._dependentsById)) {
            this._dependentsById[id] = computation;
            computation.onInvalidate(() => {
                delete this._dependentsById[id];
            });
            return true;
        }
        return false;
    }

    changed() {
        for (var id in this._dependentsById)
            this._dependentsById[id].invalidate();
    }

    hasDependents() {
        for (var id in this._dependentsById)
            return true;
        return false;
    }

    async waitForNextChange(timeout?: number) {
        const err = new Error('timeout');
        return new Promise((resolve, reject) => {
            const tm = timeout && setTimeout(() => {
                reject(err);
                comp.stop();
            }, timeout)
            const comp = autorun((comp) => {
                this.depend();
                if (!comp.firstRun) {
                    if (tm)
                        clearTimeout(tm);
                    resolve();
                    comp.stop();
                }
            })
        })
    }
}


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

export function autorun(f: (comp: Computation) => void, options?: ComputationOptions) {
    return Tracker.autorun(f, options);
}

export function flush() {
    Tracker.flush();
}