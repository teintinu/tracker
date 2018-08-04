/// <reference types="react" />
import * as React from "react";
export interface IRunOptions {
    finishSynchronously?: boolean;
}
export interface IComputationOptions {
    onError?: (error: Error) => void;
}
export declare class Computation {
    stopped: boolean;
    invalidated: boolean;
    firstRun: boolean;
    id: number;
    parent: Computation;
    private onInvalidateCallbacks;
    private onStopCallbacks;
    private func;
    private onError?;
    private recomputing;
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
    dependentsById: {
        [name: string]: Computation;
    };
    constructor();
    depend(computation?: Computation): boolean;
    changed(): void;
    hasDependents(): boolean;
    waitForNextChange(timeout?: number): any;
    waitForNextChange(condition: () => boolean, timeout?: number): any;
    ignoreNextChanges(timeout: number): Promise<{}>;
    rx<P>(Component: React.ComponentType<P>): React.ComponentClass<P>;
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
export declare function autorun(f: (comp: Computation) => void, options?: IComputationOptions): Computation;
export declare function flush(): void;
