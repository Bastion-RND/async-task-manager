"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class AsyncTaskQueue {
    constructor(queueConfig) {
        this._debugMode = false;
        this._items = [];
        this._retryNumber = null;
        this._pendingPromise = false;
        this._debugMode = queueConfig.debug;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    ;
    unshiftToQueue(item) {
        this._items.reverse().push(item);
        this._items.reverse();
    }
    ;
    dequeue() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._pendingPromise)
                return;
            const item = this._items.shift();
            if (!item)
                return;
            try {
                this._pendingPromise = true;
                const payload = yield item.task(this);
                if (item.config && item.config.resolve) {
                    if (this._debugMode)
                        console.debug(`Resolved with value: ${JSON.stringify(payload)}`);
                    item.config.resolve(payload);
                }
                else {
                    if (this._debugMode)
                        console.debug(`Received value: ${JSON.stringify(payload)}`);
                }
            }
            catch (e) {
                if (item.config === undefined)
                    return;
                if (this._retryNumber !== null) {
                    this._retryNumber = this._retryNumber === 1 ? null : this._retryNumber - 1;
                    if (this._retryNumber !== null)
                        this.unshiftToQueue(item);
                    const { config } = item;
                    if (this._debugMode)
                        console.debug(`Retries count: ${this._retryNumber !== null ? this._retryNumber + 1 : 1}`);
                    if (((_a = config === null || config === void 0 ? void 0 : config.retry) === null || _a === void 0 ? void 0 : _a.delay) !== undefined) {
                        yield this.dequeue();
                        if (this._retryNumber === config.retry.count - 1) {
                            yield this.sleep(config.retry.delay);
                        }
                    }
                    else {
                        yield this.dequeue();
                    }
                }
                if (this._retryNumber !== null)
                    return;
                const { config } = item;
                if (config === null || config === void 0 ? void 0 : config.clearIfReject) {
                    if (this._debugMode)
                        console.debug('Cleared task queue');
                    this.clearQueue();
                }
                if (config === null || config === void 0 ? void 0 : config.reject) {
                    if (this._debugMode)
                        console.debug(`Rejected with value: ${JSON.stringify(e)}`);
                    config.reject(e);
                }
                else {
                    if (this._debugMode)
                        console.debug(`Received value: ${JSON.stringify(e)}`);
                }
            }
            finally {
                this._pendingPromise = false;
                if (((_c = (_b = item.config) === null || _b === void 0 ? void 0 : _b.retry) === null || _c === void 0 ? void 0 : _c.delay) !== undefined)
                    yield this.sleep(item.config.retry.delay);
                yield this.dequeue();
            }
        });
    }
    ;
    enqueue(task, config) {
        this._items.push({ task, config });
        if ((config === null || config === void 0 ? void 0 : config.retry) && config.retry.count) {
            this._retryNumber = config.retry.count;
        }
        this.dequeue();
        return this;
    }
    ;
    clearQueue() {
        if (this._debugMode)
            console.debug(`Cleared tasks queue`);
        this._items = [];
    }
}
exports.default = AsyncTaskQueue;
//# sourceMappingURL=index.js.map