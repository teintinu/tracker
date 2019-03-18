import * as React from "react";
import "@hoda5/extensions";
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
    constructor(h5debugname: string, f: (comp: Computation) => void, parent: Computation, onError?: (error: Error) => void);
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
export declare class Dependency<T extends object = {}> {
    dependentsById: {
        [name: string]: Computation;
    };
    constructor(h5debugname: string, initialvalue?: T);
    depend(computation?: Computation): boolean;
    value: T;
    changed(): void;
    hasDependents(): boolean;
    waitForNextChange(timeout?: number): Promise<void>;
    waitForNextChange(condition: () => boolean, timeout?: number): Promise<void>;
    ignoreNextChanges(timeout: number): Promise<void>;
}
export declare function reactProvider(h5debugname: string, Component: React.ComponentType<{}>, dependencies: Array<Dependency<any>>): {
    dependencies: {
        readonly list: Dependency<any>[];
        add(dependency: Dependency<{}>): void;
        remove(dependency: Dependency<{}>): void;
    };
    render: React.ComponentType<{}>;
};
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
export declare function autorun(h5debugname: string, f: (comp: Computation) => void, options?: IComputationOptions): Computation;
export declare function flush(): void;
export declare function nonreactive<T>(f: () => T): T;
export declare function afterFlush(f: () => void): void;
