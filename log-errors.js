const chalk = require('chalk')
const debounce = require('lodash.debounce')

let list = []

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