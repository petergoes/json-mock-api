const util = require('util');
const waitOn = require('wait-on');
const fetch = require('node-fetch');
const spawn = require('child_process').spawn;
const path = require('path')
const jsonMockApi = path.join(__dirname, '..', 'bin/json-mock-api')

function generateChildProcess(
  { 
    origin = 'http://localhost:4000',
    options = ['-p', '4000'],
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

describe('The API', () => {
  it('should generate endpoints for json files in the directory folder', async () => {
      let child
      try {
        child = await generateChildProcess()
      } catch (error) {
        expect(error.message).toBe(undefined)
      }

      const index = await fetch('http://localhost:4000').then(res => res.json())
      const a = await fetch('http://localhost:4000/a').then(res => res.json())
      const c = await fetch('http://localhost:4000/b/c').then(res => res.json())
      child.kill()
      expect(index).toStrictEqual(require('./api/index.json'))
      expect(a).toStrictEqual(require('./api/a.json'))
      expect(c).toStrictEqual(require('./api/b/c.json'))
  })

  it('should generate endpoints for specific HTML verbs defined in the file name', async () => {
      let child
      try {
        child = await generateChildProcess()
      } catch (error) {
        expect(error.message).toBe(undefined)
      }

      const post = await fetch('http://localhost:4000/d', { method: 'POST' }).then(res => res.json())
      const put = await fetch('http://localhost:4000/d', { method: 'PUT' }).then(res => res.json())
      const deleteVerb = await fetch('http://localhost:4000/a', { method: 'DELETE' }).then(res => res.json())
      child.kill()
      expect(post).toStrictEqual(require('./api/d.post.json'))
      expect(put).toStrictEqual(require('./api/d.put.json'))
      expect(deleteVerb).toStrictEqual(require('./api/a.json'))
  })
})