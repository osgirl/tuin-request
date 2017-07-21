const promiseRetry = require('promise-retry')

const verbs = ['get', 'head', 'post', 'put', 'patch', 'del', 'delete']

const defaultOptions = {
  retry: null,
}

const defaultOptionsRetry = {
  on: () => {},
  codes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ESOCKETTIMEDOUT', 'ECONNREFUSED', 'EPIPE'],
  statusCodes: [500, 502, 503, 504],
}

function wrap(requestMethod, options) {
  if (options.retry) {
    return (...args) => {
      return retryRequest(() => requestMethod(...args), options.retry)
    }
  }
  return (...args) => {
    return requestMethod(...args)
  }
}

function decorate(rpn, options) {
  const opts = Object.assign({}, defaultOptions, options || {})
  const request = wrap(rpn, opts)
  for (const verb of verbs) {
    request[verb] = wrap(rpn[verb], opts)
  }
  request.defaults = (...args) => decorate(rpn.defaults(...args), opts)
  request.forever = (...args) => decorate(rpn.forever(...args), opts)
  request.jar = rpn.jar
  request.cookie = rpn.cookie
  request.retry = retryOptions => {
    const retryOpts = Object.assign(defaultOptionsRetry, retryOptions || {})
    return decorate(rpn, Object.assign(options, {retry: retryOpts}))
  }
  return request
}

function retryRequest(func, options) {
  const result = promiseRetry((retry, number) => {
    return func().catch(err => {
      const code = (err.cause || {}).code
      if (options.codes.includes(code) || options.statusCodes.includes(err.statusCode)) {
        options.on(err, number)
        retry(err)
      }
      throw err
    })
  }, options)
  return result
}

module.exports = decorate(require('request-promise-native'))
