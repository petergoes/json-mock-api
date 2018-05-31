const fs = require('fs')
const path = require('path')
const express = require('express')
const Router = require('express').Router
const app = express()

const router = Router()

const PORT = process.env.PORT || 8378

const filterFiles = re => files => new RegExp(re).test(files)

router.all('*', (req, res) => {
  const url = req.url
  const method = req.method.toLowerCase()
  const [input, folder, file] = /(.+\/)([\w-]+)\/?$/.exec(url)
  try {
    const filesInFolder = fs
      .readdirSync(path.join(__dirname, folder))
      .filter(filterFiles(file))
      .filter(filterFiles(`${method}|${file}.[json|txt]`))

    const methodFileJSON = filesInFolder.find(filterFiles(`.${method}.json`))
    const methodFileText = filesInFolder.find(filterFiles(`.${method}.txt`))
    const allFileJSON = filesInFolder.find(filterFiles(`${file}.json`))
    const allFileText = filesInFolder.find(filterFiles(`${file}.txt`))

    if (methodFileJSON) {
      res.json(require(path.join(__dirname, folder, methodFileJSON)))
    } else if (methodFileText) {
      res.send(fs.readFileSync(path.join(__dirname, folder, methodFileText)))
    } else if (allFileJSON) {
      res.json(require(path.join(__dirname, folder, allFileJSON)))
    } else if (allFileText) {
      res.send(fs.readFileSync(path.join(__dirname, folder, allFileText)))
    } else {
      res
        .status(404)
        .send({ error: `${input}.${method}.json or ${input}.json not found` })
    }
  } catch (err) {
    if (new RegExp('no such file').test(err.message)) {
      res
        .status(404)
        .send({ error: `${input}.${method}.json or ${input}.json not found` })
    } else {
      res.status(500).send({ error: err.message })
    }
  }
})

app.use(router)

app.listen(PORT, () =>
  process.stdout.write(`Mock server running on port ${PORT}`),
)

