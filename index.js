const fs = require('fs')
const path = require('path')
const express = require('express')
const Router = require('express').Router
const app = express()

const router = Router()
const filterFiles = re => files => new RegExp(re).test(files)
const isFunction = fn => typeof fn === 'function'
const isNotFunction = fn => !isFunction(fn)

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
    const url = req.url
    const method = req.method.toLowerCase()
  
    try {
      const cleanUrl = url.replace(/(\?.*)/, '') // strip query params
      const [input, folder = '.', file] = /(.+\/)?([\w-]+)\/?$/.exec(cleanUrl)
      const filesInFolder = fs
        .readdirSync(path.join(FILES_DIR, folder))
        .filter(filterFiles(file))
        .filter(filterFiles(`${method}|${file}.[json|txt]`))

      const methodFileJSON = filesInFolder.find(filterFiles(`.${method}.json`))
      const methodFileText = filesInFolder.find(filterFiles(`.${method}.txt`))
      const allFileJSON = filesInFolder.find(filterFiles(`${file}.json`))
      const allFileText = filesInFolder.find(filterFiles(`${file}.txt`))

      if (methodFileJSON) {
        res.json(require(path.join(FILES_DIR, folder, methodFileJSON)))
      } else if (methodFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, methodFileText)))
      } else if (allFileJSON) {
        res.json(require(path.join(FILES_DIR, folder, allFileJSON)))
      } else if (allFileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, allFileText)))
      } else {
        res
          .status(404)
          .send({ error: `${input}.${method}.json or ${input}.json not found` })
      }
    } catch (err) {
      if (new RegExp('no such file').test(err.message)) {
        res
          .status(404)
          .send({ error: `${cleanUrl}.${method}.json or ${cleanUrl}.json not found` })
      } else {
        res.status(500).send({ error: err.message })
      }
    }
  }
}  

function jsonMockApi(port, dir, middleware) {
  const PORT = port || 3000
  const FILES_DIR = path.join(process.cwd(), dir) || process.cwd()
  const routeHandler = createRouteHandler(PORT, FILES_DIR)
  const userMiddleware = loadUserMiddleware(middleware)
  const userMiddlewareLoaded = userMiddleware.filter(isFunction)
  const userMiddlewareError = userMiddleware.filter(isNotFunction)

  router.all('*', ...[...userMiddlewareLoaded, routeHandler])

  app.use(router)

  app.listen(PORT, () => {
    if (userMiddlewareError.length) {
      console.log('\n---\n')
      console.log('Middleware not loaded (see errors above):\n')
      userMiddlewareError.forEach(file => {
        console.log(` * ${file}`)
      });
    }
    console.log(`\n> JsonMockServer running on port http://localhost:${PORT}\n`)
  })
}

module.exports = jsonMockApi