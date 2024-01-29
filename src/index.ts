type QueueItem = {
    task: QueueTask,
    config?: QueueTaskConfig,
};

type QueueTask = (data: unknown) => Promise<unknown>;

type QueueTaskConfig = {
    resolve?: (args?: unknown) => unknown | Promise<unknown>,
    reject?: (args?: unknown) => unknown | Promise<unknown>,
    clearIfReject?: boolean,
    retry?: QueueTaskRetryConfig,
};

type QueueTaskRetryConfig = {
    count: number,
    delay: number,
};

interface IQueue {
    enqueue: (task: QueueTask, config?: QueueTaskConfig) => IQueue;
    clearQueue: () => void,
}

type AsyncTaskQueueConfig = {
    debug: boolean,
};

class AsyncTaskQueue implements IQueue {
    constructor(queueConfig: AsyncTaskQueueConfig) {
        this._debugMode = queueConfig.debug;
    }

    private _debugMode = false;
    private _items: Array<QueueItem> = [];
    private _retryNumber: number | null = null;
    private _pendingPromise: boolean = false;

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    private unshiftToQueue(item: QueueItem): void {
        this._items.reverse().push(item);
        this._items.reverse();
    };

    private async dequeue(): Promise<void> {
        if (this._pendingPromise) return;

        const item = this._items.shift();

        if (!item) return;

        try {
            this._pendingPromise = true;
            const payload = await item.task(this);

            if (item.config && item.config.resolve) {
                if (this._debugMode) console.debug(`Resolved with value: ${JSON.stringify(payload)}`);
                item.config.resolve(payload);
            } else {
                if (this._debugMode) console.debug(`Received value: ${JSON.stringify(payload)}`);
            }
        } catch (e: unknown) {
            if (item.config === undefined) return;

            if (this._retryNumber !== null) {
                this._retryNumber = this._retryNumber === 1 ? null : this._retryNumber - 1;

                if (this._retryNumber !== null) this.unshiftToQueue(item);

                const { config } = item;

                if (this._debugMode) console.debug(`Retries count: ${this._retryNumber !== null ? this._retryNumber + 1 : 1}`);

                if (config?.retry?.delay !== undefined) {
                    await this.dequeue();

                    if (this._retryNumber === config.retry.count - 1) {
                        await this.sleep(config.retry.delay);
                    }
                } else {
                    await this.dequeue();
                }
            }

            if (this._retryNumber !== null) return;

            const { config } = item;

            if (config?.clearIfReject) {
                if (this._debugMode) console.debug('Cleared task queue');
                this.clearQueue();
            }

            if (config?.reject) {
                if (this._debugMode) console.debug(`Rejected with value: ${JSON.stringify(e)}`);
                config.reject(e);
            } else {
                if (this._debugMode) console.debug(`Received value: ${JSON.stringify(e)}`);
            }
        } finally {
            this._pendingPromise = false;

            if (item.config?.retry?.delay !== undefined) await this.sleep(item.config.retry.delay);

            await this.dequeue();
        }
    };

    enqueue(task: QueueTask, config?: QueueTaskConfig): IQueue {
        this._items.push({ task, config });

        if (config?.retry && config.retry.count) {
            this._retryNumber = config.retry.count;
        }

        this.dequeue();
        return this;
    };

    clearQueue(): void {
        if (this._debugMode) console.debug(`Cleared tasks queue`);
        this._items = [];
    }
}

export default AsyncTaskQueue;
