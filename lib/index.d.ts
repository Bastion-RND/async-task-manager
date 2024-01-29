type QueueTask = (data: unknown) => Promise<unknown>;
type QueueTaskConfig = {
    resolve?: (args?: unknown) => unknown | Promise<unknown>;
    reject?: (args?: unknown) => unknown | Promise<unknown>;
    clearIfReject?: boolean;
    retry?: QueueTaskRetryConfig;
};
type QueueTaskRetryConfig = {
    count: number;
    delay: number;
};
interface IQueue {
    enqueue: (task: QueueTask, config?: QueueTaskConfig) => IQueue;
    clearQueue: () => void;
}
type AsyncTaskQueueConfig = {
    debug: boolean;
};
declare class AsyncTaskQueue implements IQueue {
    constructor(queueConfig: AsyncTaskQueueConfig);
    private _debugMode;
    private _items;
    private _retryNumber;
    private _pendingPromise;
    private sleep;
    private unshiftToQueue;
    private dequeue;
    enqueue(task: QueueTask, config?: QueueTaskConfig): IQueue;
    clearQueue(): void;
}
export default AsyncTaskQueue;
//# sourceMappingURL=index.d.ts.map