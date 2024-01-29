# async-task-manager

This package is an asynchronous task manager for organizing the sequential execution of asynchronous tasks.

## Documentation

- [Install](#install)
- [Usage](#usage)
  - [Chaining](#chaining)
- [Contributing](#contributing)
- [License](#license)

## Install

This generator requires [node](https://nodejs.org) and [npm](https://npmjs.com).

You can install it by running:

```sh
npm install @bs-solutions/async-task-manager
```

## Usage

First you need to create a new instance of the class AsyncTaskQueue (with parameter `debug: true` if you want to see logs with task execution results in the console): 

```ts
const asyncQueue = new AsyncTasksQueue({ debug: true });
```

Then you can use the following methods:
- `asyncQueue.enqueue()` method adds an asynchronous task to the queue. This method has two parameters: required parameter `queueTask` and optional parameter `queueTaskConfig`.
  `queueTaskConfig` type config looks like this:
   ```ts
  type QueueTaskConfig = { 
      resolve?: (args?: unknown) => unknown | Promise<unknown>,
      reject?: (args?: unknown) => unknown | Promise<unknown>,
      clearIfReject?: boolean,
      retry?: {
        count: number,
        delay: number,
      },
  };
   ``` 
   You can see an example below:
  ```ts
  asyncQueue.enqueue(
    () => someAsyncFunc(),  // the task you want to add to the queue
    {
      resolve: (result) => callbackFunc(result), // will be executed if tasks resolve
      reject: (result) => callbackFunc(result), // will be executed if tasks reject
      clearIfReject: true, // clears all tasks from queue if tasks reject 
      retry: {
        count: 3, // determines the number of attempts
        delay: 2500, // defines the delay between attempts
      },
    },
  );
  ```
- `asyncQueue.clearQueue()` method removes all tasks from the queue.

## Chaining

`asyncQueue.enqueue()` method always returns an instance of the `asyncQueue` class, so chaining is supported, and you can use it like this:

```ts
asyncQueue
  .enqueue(() => func())
  .enqueue(() => func2())
  .clearQueue();
```

## Maintainer

[@VladSolyony](https://github.com/VladSolyony)

## Contributing

Please contribute! [Look at the issues](https://github.com/Bastion-RND/async-task-manager/issues).

## License

MIT © 2024