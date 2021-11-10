const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const logErrors = require('./log-errors')
const express = require("express");

const filenameMatching = require('./lib/filename-matching')
const noop = require('./lib/noop')

/**
 * 
 * @param {String} FILES_DIR The directory where the JSON files are stored
 * @returns {RouteHandler}
 */
module.exports = function createRouteHandler(FILES_DIR) {

  /**
   * Express middleware function that finds and returns the desired file. If the
   * file can't be found, it returns an error
   * @typedef RouteHandler
   * @type {function}
   * @param {express.Request} req
   * @param {express.Response} res
   */
  return function routeHandler(req, res) {
    /** The requested URL */
    const url = req.url || ''

    /** Lowercase method used in request  */
    const method = req.method.toLowerCase()

    /** URL without query params */
    const cleanUrl = url.replace(/(\?.*)/, '')

    try {
      /** The requested cleanURL */
      let input
      
      /**
       * The folder part of the requested URL  
       * Given the requested url: `/path/to/`file
       */
      let folder

      /**
       * The last part of the requested URL  
       * Given the requested url: /path/to/`file`
       */
      let file

      // Deconstruct the url into parts so we know where to find the file 
      // the user requested 
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

      /**
       * All the files in the folder part of the requested url
       */
      const allFilesInFolder = fs
        .readdirSync(path.join(FILES_DIR, folder))

      // If the file part of the requested url happens to be a folder on disk,
      // we expect to find an index.[json|txt] file, potentially with verb
      // versions as well. In that case, add these to the allFilesInFolder array
      try {
        const subfiles = fs.readdirSync(path.join(FILES_DIR, folder, file))
        if (subfiles.length > 0) {
          subfiles.forEach(subfile => allFilesInFolder.push(`${file}/${subfile}`))
        }
      } catch (err) {
        noop()
      }

      /** Only files that match the file part of the requested URL or index. */
      const filesInFolder = allFilesInFolder
        .filter(filenameMatching(file))
        .filter(filenameMatching(`${method}|${file}(\/index)*.[json|txt]`))

      const indexMethodFileJSON = filesInFolder.find(filenameMatching(`${file}/index.${method}.json`))
      const indexMethodFileText = filesInFolder.find(filenameMatching(`${file}/index.${method}.txt`))
      const indexFileJSON = filesInFolder.find(filenameMatching(`${file}/index.json`))
      const indexFileText = filesInFolder.find(filenameMatching(`${file}/index.txt`))
      const methodFileJSON = filesInFolder.find(filenameMatching(`.${method}.json`))
      const methodFileText = filesInFolder.find(filenameMatching(`.${method}.txt`))
      const fileJSON = filesInFolder.find(filenameMatching(`${file}.json`))
      const fileText = filesInFolder.find(filenameMatching(`${file}.txt`))

      // Send the file when found.
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
      } else if (fileJSON) {
        res.json(JSON.parse(fs.readFileSync(path.join(FILES_DIR, folder, fileJSON))))
      } else if (fileText) {
        res.send(fs.readFileSync(path.join(FILES_DIR, folder, fileText)))

      // We could not find the file on disk based on the deconstructed url parts
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

      // The else statement above was not reached for some reason. Still we get 
      // an `No such file` error. So send an 404
      if (new RegExp('no such file').test(err.message)) {
        logErrors(
          `${chalk.yellow(`${cleanUrl}.${method}.json`)} or ${chalk.yellow(`${cleanUrl}.json`)} not found`,
          404
        )
        res
          .status(404)
          .send({ error: `${cleanUrl}.${method}.json or ${cleanUrl}.json not found` })

      // Something else went wrong entirely, probably something in the provided
      // middleware. Send the error message along so the user can debug it by
      // itself
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