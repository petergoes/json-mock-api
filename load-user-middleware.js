const path = require('path')

/**
 * Loads middleware functions provided by the user
 * 
 * @param {String[]} middlewareFiles Paths to files to load, relative to `cwd`
 * @returns {Function[]} Array of loaded middleware functions
 */
module.exports = function loadUserMiddleware(middlewareFiles) {
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