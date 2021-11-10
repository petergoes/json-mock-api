const chalk = require('chalk')
const debounce = require('lodash.debounce')

/**
 * Object describing the error with a status code
 * @typedef ErrorObject
 * @type {Object}
 * @prop {String} message The message to be logged
 * @prop {Number} statusCode The statusCode
 */

/**
 * List of errors to be displayed
 * @type {Array.<ErrorObject>}
 */
let list = []

/**
 * Logs an error to the console with a timestamp. If multiple errors are logged
 * at the same time, they are logged as a group with the same timestamp
 * @param {String} message The message to be logged
 * @param {Number} statusCode The statusCode to be logged
 */
function logErrors(message, statusCode) {
  list.push({ message, statusCode })
  debouncedWrite()
}

const debouncedWrite = debounce(function write() {
  const now = new Date(Date.now())
  const hours = `${now.getHours()}`.padStart(2, '0')
  const minutes = `${now.getMinutes()}`.padStart(2, '0')
  const seconds = `${now.getSeconds()}`.padStart(2, '0')
  
  console.log(chalk.red(`Error (${hours}:${minutes}:${seconds}):`))
  list.forEach(({ message, statusCode }) => console.log(`  ${statusCode}: ${message}`))
  console.log('')

  list = []
}, 500)

module.exports = logErrors