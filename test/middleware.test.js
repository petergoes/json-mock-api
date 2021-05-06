const util = require('util');
const waitOn = require('wait-on');
const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
const path = require('path')
const jsonMockApi = path.join(__dirname, '..', 'bin/json-mock-api')

function generateChildProcess(
  { 
    origin = 'http://localhost:5000',
    options = ['-p', '5000', '-m', './middleware.js'],
    cwd = path.join(__dirname, 'api')
  } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn( 
      `${jsonMockApi}`,
      options,
      { cwd }
    )
    var opts = {
      resources: [ origin ],
      timeout: 3000,
    }
    child.stderr.on('data', str => reject(`${str}`))
    child.stdout.on('data', async str => {
      try {
        await waitOn(opts)
        resolve(child)
      } catch (error) {
        child.kill()
        reject(error)
      }  
    })
  })
}

describe('Middleware', () => {
  it('should be providable by the user', async () => {
      let child
      try {
        child = await generateChildProcess()
      } catch (error) {
        expect(error).toBe(undefined)
      }

      const middleware = await fetch('http://localhost:5000/middleware').then(res => res.text())
      child.kill()
      expect(middleware).toStrictEqual('Hello from middleware')
  })
})