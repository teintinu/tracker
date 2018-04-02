export declare type RunOptions = {
    finishSynchronously?: boolean;
};
export declare type ComputationOptions = {
    onError?: (error: Error) => void;
};
export declare class Computation {
    stopped: boolean;
    invalidated: boolean;
    firstRun: boolean;
    _id: number;
    _onInvalidateCallbacks: Array<(comp: Computation) => void>;
    _onStopCallbacks: Array<(comp: Computation) => void>;
    _parent: Computation;
    _func: (comp: Computation) => void;
    _onError?: (error: Error) => void;
    _recomputing: boolean;
    constructor(f: (comp: Computation) => void, parent: Computation, onError?: (error: Error) => void);
    onInvalidate(f: (comp: Computation) => void): void;
    onStop(f: (comp: Computation) => void): void;
    invalidate(): void;
    stop(): void;
    _compute(): void;
    _needsRecompute(): boolean;
    _recompute(): void;
    flush(): void;
    run(): void;
}
export declare class Dependency {
    _dependentsById: {
        [name: string]: Computation;
    };
    constructor();
    depend(computation?: Computation): boolean;
    changed(): void;
    hasDependents(): boolean;
    waitForNextChange(timeout?: number): Promise<{}>;
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
export declare function autorun(f: (comp: Computation) => void, options?: ComputationOptions): Computation;
export declare function flush(): void;
