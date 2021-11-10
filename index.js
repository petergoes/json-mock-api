const fs = require('fs')
const pkg = require('./package.json')
const path = require('path')
const cors = require('cors')
const chalk = require('chalk')
const express = require('express')
const Router = require('express').Router
const bodyParser = require('body-parser');
const loadUserMiddleware = require('./load-user-middleware.js')
const createRouteHandler = require('./create-route-handler.js')
const app = express()
const router = Router()

const isFunction = require('./lib/is-function')
const isNotFunction = require('./lib/is-not-function')

/**
 * Creates an api based on JSON or txt files.
 * 
 * @param {Number} port The port number to listen to
 * @param {String} dir The directory where the JSON files are stored relative to cwd
 * @param {String[]} middleware Array of paths to files containing middleware
 * @param {Boolean} enableCors Should cors be enabled by default
 */
function jsonMockApi(port, dir, middleware, enableCors) {
  /** The port to listen to */
  const PORT = port || 3000

  /** The directory where the JSON files are stored */
  const FILES_DIR = path.join(process.cwd(), dir) || process.cwd()

  /**
   * Express middleware function that finds and returns the desired file.
   * If the file can't be found, it returns an error
   */
  const routeHandler = createRouteHandler(FILES_DIR)

  /** 
   * List of middleware functions provided by the user
   */
  const userMiddleware = loadUserMiddleware(middleware)

  /** Array of the successfully loaded middleware */
  const userMiddlewareLoaded = userMiddleware.filter(isFunction)

  /** Array of the middleware that failed to load */
  const userMiddlewareError = userMiddleware.filter(isNotFunction)

  router.all('*', ...[...userMiddlewareLoaded, routeHandler])

  enableCors && app.use(cors())
  app.use(bodyParser.json());
  app.use(router)

  app.listen(PORT, () => {
    if (userMiddlewareError.length) {
      console.log('\n---\n')
    } else {
      console.clear()
    }

    console.log(chalk.green(`Json Mock Api (v${pkg.version}) is running`))
    console.log('')

    if (enableCors) {
      console.log(`Cors is ${chalk.green('enabled')}`)
      console.log('')
    } else {
      console.log('Cors is disabled.')
      console.log(`  Enable it for all requests by adding the ${chalk.cyan('--cors')} flag,`)
      console.log(`  or add your own middleware for more control.`)
      console.log('')
    }

    if (userMiddlewareError.length === 0 && middleware.length) {
      console.log('Middleware file(s) loaded:')
      console.log('')
      middleware.forEach(file => {
        console.log(`  ${file}`)
      })
      console.log('')
    } else if (userMiddlewareError.length) {
      console.log(chalk.red('Middleware not loaded (see errors above):\n'))
      userMiddlewareError.forEach(file => {
        console.log(` * ${file}`)
      });
      console.log('')
    }
    console.log(`You can ${userMiddlewareError.length ? chalk.bold('still') : 'now'} query json files stored in ${chalk.yellow(`./${path.relative(process.cwd(), FILES_DIR)}`)}`)
    console.log('')
    console.log(`  ${chalk.bold('Endpoint')}: http://localhost:${chalk.bold(PORT)}`)
    console.log('')
  })
}

module.exports = jsonMockApi