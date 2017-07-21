# tuin-request

Adds the following functionality to `request-promise-native`:

* Retries (function `retry`)

If none of the functions above have been invoked on the `tuin-request` object,
all calls are delegated to the `request-promise-native` library without
modification.

## Retries

Enables retries for all request methods on the `request-promise-native` object.

Usage:

```
const request = require('tuin-request').retry({
  on: (err, number) => {}, // Invoked when a retry occurs
  retries: 10, // The maximum amount of times to retry the operation
  factor: 2, // The exponential factor to use
  minTimeout: 1000, // The number of milliseconds before starting the first retry
  maxTimeout: Infinity, // The maximum number of milliseconds between two retries
  randomize: false, // Randomizes the timeouts by multiplying with a factor between 1 to 2
})

const requestJson = request.defaults({json: true})
requestJson.get('...')
```

The options `retries`, `factor`, `minTimeout`, `maxTimeout`, and `randomize`
are passed as-is to the `promise-retry` library.
