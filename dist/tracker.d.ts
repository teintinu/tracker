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
    waitForNextChange(timeout?: number): Promise<{}>;
    rx<T>(render: () => React.ReactElement<T>): {
        new (props: T, context?: any): {
            comp?: any;
            componentWillMount(): void;
            componentWillUnmount(): void;
            render(): React.ReactElement<T>;
            setState<K extends string | number | symbol>(state: any, callback?: () => void): void;
            forceUpdate(callBack?: () => void): void;
            props: Readonly<{
                children?: React.ReactNode;
            }> & Readonly<T>;
            state: Readonly<any>;
            context: any;
            refs: {
                [key: string]: React.ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<T>, nextState: Readonly<any>, nextContext: any): boolean;
            componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<T>, prevState: Readonly<any>): any;
            componentDidUpdate?(prevProps: Readonly<T>, prevState: Readonly<any>, snapshot?: any): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<T>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<T>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<T>, nextState: Readonly<any>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<T>, nextState: Readonly<any>, nextContext: any): void;
        };
    };
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
