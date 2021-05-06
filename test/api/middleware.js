module.exports = function(req, res, next) {
  if (req.path === '/middleware') {
    res.send('Hello from middleware')
  } else {
    next()
  }
}
