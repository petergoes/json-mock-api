const fs = require('fs')
const path = require('path')
const express = require('express')
const Router = require('express').Router
const app = express()

const router = Router()

function jsonMockApi(port, dir) {
  const PORT = port || 3000
  const FILES_DIR = path.join(process.cwd(), dir) || process.cwd()

  const filterFiles = re => files => new RegExp(re).test(files)

  router.all('*', (req, res) => {
    const url = req.url
    const method = req.method.toLowerCase()
    
    try {
      const [input, folder = '.', file] = /(.+\/)?([\w-]+)\/?$/.exec(url)
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
          .send({ error: `${url}.${method}.json or ${url}.json not found` })
      } else {
        res.status(500).send({ error: err.message })
      }
    }
  })

  app.use(router)

  app.listen(PORT, () => {
    console.log(`\n> Mock server running on port http://localhost:${PORT}\n`)
  })
}

module.exports = jsonMockApi