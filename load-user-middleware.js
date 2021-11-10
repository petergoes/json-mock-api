const path = require('path')

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