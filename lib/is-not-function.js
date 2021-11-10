const isFunction = require('./is-function')

/**
 * Is the provided value NOT of type function
 * @param {any} value The value to be tested
 * @returns Boolean
 */
 const isNotFunction = value => !isFunction(value)

 module.exports = isNotFunction