const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path')
const pkg = require('../package.json')
const jsonMockApi = path.join(__dirname, '..', 'bin/json-mock-api')

const helpMenu = `Usage: json-mock-api [options]

${pkg.name} (v${pkg.version}): ${pkg.description}

Options:
  -v, --version             output the version number
  -d, --directory [path]    Directory (default: ".")
  -m, --middleware <files>  Expressjs middleware (default: [])
  -p, --port [number]       Port (default: "3000")
  -h, --help                display help for command

Examples:

  $ json-mock-api --middleware ./middleware-1.js,./middleware-2.js

`

describe('The CLI', () => {
  describe('option', () => {
    describe('-v', () => {
      it('should output the current version number', async () => {
        const { stdout, stderr } = await exec(`${jsonMockApi} -v`)

        expect(stdout).toBe(`${pkg.version}\n`)
        expect(stderr).toBe("")
      })
    })
    describe('--version', () => {
      it('should output the current version number', async () => {
        const { stdout, stderr } = await exec(`${jsonMockApi} --version`)

        expect(stdout).toBe(`${pkg.version}\n`)
        expect(stderr).toBe("")
      })
    })
    describe('-h', () => {
      it('should output a help menu', async () => {
        const { stdout, stderr } = await exec(`${jsonMockApi} -h`)

        expect(stdout).toBe(helpMenu)
        expect(stderr).toBe("")
      })
    })
    describe('--help', () => {
      it('should output a help menu', async () => {
        const { stdout, stderr, kill } = await exec(`${jsonMockApi} --help`)

        expect(stdout).toBe(helpMenu)
        expect(stderr).toBe("")
      })
    })
  })
})
