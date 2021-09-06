const fs = require('fs')
const pkg = require('./package.json')
const path = require('path')
const cors = require('cors')
const chalk = require('chalk')
const express = require('express')
const Router = require('express').Router
const bodyParser = require('body-parser');
const logErrors = require('./log-errors')
const app = express()
const router = Router()
const filterFiles = re => files => new RegExp(re).test(files)
const isFunction = fn => typeof fn === 'function'
const isNotFunction = fn => !isFunction(fn)
const noop = () => {}

function loadUserMiddleware(middlewareFiles) {
  const cwd = process.cwd()
  return middlewareFiles
    .map(middlewareFile => {
      let fn = undefined
      try {
        fn = require(path.join(cwd, middlewareFile))
      } catch (error) {
        console.log(/Cannot find module/.test(error.message) ? error.message : error)
        fn = middlewareFile
      }
      return fn
    })
}

function createRouteHandler(PORT, FILES_DIR) {
  return function routeHandler(req, res) {
    const url = req.url || ''
    const method = req.method.toLowerCase()
    const cleanUrl = url.replace(/(\?.*)/, '') // strip query params
  
    try {
      let input
      let folder
      let file
      try {
        const [_input, _folder = '.', _file] = /(.+\/)?([\w-]+)\/?$/.exec(cleanUrl)
        input = _input
        folder = _folder
        file = _file
      } catch (error) {
        if (cleanUrl === '/') {
          folder = '.'
          file = 'index'
        }
      }

      const allFilesInFolder = fs
        .readdirSync(path.join(FILES_DIR, folder))

      try {
        const subfolder = fs.readdirSync(path.join(FILES_DIR, folder, file))
        if (subfolder.length > 0) {
          subfolder.forEach(subfile => allFilesInFolder.push(`${file}/${subfile}`))
        }
      } catch (err) {
        noop()
      }


      const filesInFolder = allFilesInFolder
        .filter(filterFiles(file))
        .filter(filterFiles(`${method}|${file}(\/index)*.[json|txt]`))

      const indexMethodFileJSON = filesInFolder.find(filterFiles(`${file}/index.${method}.json`))
      const indexMethodFileText = filesInFolder.find(filterFiles(`${file}/index.${method}.txt`))
      const indexFileJSON = filesInFolder.find(filterFiles(`${file}/index.json`))
      const indexFileText = filesInFolder.find(filterFiles(`${file}/index.txt`))
      const methodFileJSON = filesInFolder.find(filterFiles(`.${method}.json`))
      const methodFileText = filesInFolder.find(filterFiles(`.${method}.txt`))
      const allFileJSON = filesInFolder.find(filterFiles(`${file}.json`))
      const allFileText = filesInFolder.find(filterFiles(`${file}.txt`))

      if (indexMethodFileJSON) {
        res.json(JSON.parse(fs.readFileSync(path.join(FILES_DIR, folder, indexMethodFileJSON))))
      } else if (indexMethodFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, indexMethodFileText)))
      } else if (indexFileJSON) {
        res.json(JSON.parse(fs.readFileSync(path.join(FILES_DIR, folder, indexFileJSON))))
      } else if (indexFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, indexFileText)))
      } else if (methodFileJSON) {
        res.json(JSON.parse(fs.readFileSync(path.join(FILES_DIR, folder, methodFileJSON))))
      } else if (methodFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, methodFileText)))
      } else if (allFileJSON) {
        res.json(JSON.parse(fs.readFileSync(path.join(FILES_DIR, folder, allFileJSON))))
      } else if (allFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, allFileText)))
      } else {
        logErrors(
          `${chalk.yellow(`${input}.${method}.json`)} or ${chalk.yellow(`${input}.json`)} not found`,
          404
        )
        res
          .status(404)
          .send({ error: `${input}.${method}.json or ${input}.json not found` })
      }
    } catch (err) {
      if (new RegExp('no such file').test(err.message)) {
        logErrors(
          `${chalk.yellow(`${cleanUrl}.${method}.json`)} or ${chalk.yellow(`${cleanUrl}.json`)} not found`,
          404
        )
        res
          .status(404)
          .send({ error: `${cleanUrl}.${method}.json or ${cleanUrl}.json not found` })
      } else {
        logErrors(
          err.message,
          500
        )
        res.status(500).send({ error: err.message })
      }
    }
  }
}  

function jsonMockApi(port, dir, middleware, enableCors) {
  const PORT = port || 3000
  const FILES_DIR = path.join(process.cwd(), dir) || process.cwd()
  const routeHandler = createRouteHandler(PORT, FILES_DIR)
  const userMiddleware = loadUserMiddleware(middleware)
  const userMiddlewareLoaded = userMiddleware.filter(isFunction)
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