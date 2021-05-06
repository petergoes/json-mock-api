const util = require('util');
const waitOn = require('wait-on');
const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
const path = require('path')
const jsonMockApi = path.join(__dirname, '..', 'bin/json-mock-api')
const indexJson = require('./api/index.json')

function generateChildProcess(
  { 
    origin = 'http://localhost:3000',
    options = [],
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

describe('The server', () => {
  describe('Port', () => {
    it('should default to 3000', async () => {
      let child
      try {
        child = await generateChildProcess()      
      } catch (error) {
        expect(error.message).toBe(undefined)
      }

      const data = await fetch('http://localhost:3000').then(res => res.json())
      child.kill()
      expect(data).toStrictEqual(indexJson)
      
    })
    it('should be configurable via the --port option', async () => {
      let child
      try {
        child = await generateChildProcess({
          origin: 'http://localhost:3001',
          options: ['--port', '3001']
        })      
      } catch (error) {
        expect(error).toBe(undefined)
      }

      const data = await fetch('http://localhost:3001').then(res => res.json())
      child.kill()
      expect(data).toStrictEqual(indexJson)
    })
  })
  describe('Directory', () => {
    it('should default to cwd', async () => {
      let child
      try {
        child = await generateChildProcess()      
      } catch (error) {
        expect(error.message).toBe(undefined)
      }

      const data = await fetch('http://localhost:3000').then(res => res.json())
      child.kill()
      expect(data).toStrictEqual(indexJson)
    })
    it('should be configurable via the --directory option', async () => {
      let child
      try {
        child = await generateChildProcess({ cwd: __dirname, options: [ '--directory', 'api' ] })      
      } catch (error) {
        expect(error.message).toBe(undefined)
      }

      const data = await fetch('http://localhost:3000').then(res => res.json())
      child.kill()
      expect(data).toStrictEqual(indexJson)
    })
  })
})