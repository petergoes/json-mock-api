# Json Mock Api [![npm version](https://badge.fury.io/js/json-mock-api.svg)](https://www.npmjs.com/package/json-mock-api)

Mock an api with plain json files. This simple CLI tool allows you to turn a 
folder of static json files into a mock api server.

---

**Table of Contents:**
- [Json Mock Api](#json-mock-api)
    - [Usage](#usage)
    - [Options](#options)
    - [The Json files](#the-json-files)
    - [Handling different HTTP Verbs](#handling-different-http-verbs)
    - [Custom middleware](#custom-middleware)
    - [Author](#author)
    - [License](#license)

## Usage

Without installing 
(using [`npx`](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)
, shipped with [`npm@5.2.0`](https://github.com/npm/npm/releases/tag/v5.2.0) and 
higher)

```bash
npx json-mock-api --port 3000 --directory .
```

or 

Add `json-mock-api` to your project ...

```bash
npm install --save json-mock-api
```

... then update your package.json ...

```diff
{
    "scripts": {
+       "mock": "json-mock-api --port 3000 --directory ."
    }
}
```

... and finally run the command

```bash
npm run mock
```

## Options

```
Usage: json-mock-api [options]

Options:

  -v, --version             output the version number
  -d, --directory [path]    Directory (default: .)
  -m, --middleware <files>  Expressjs middleware (default: )
  -p, --port [number]       Port (default: 3000)
  -h, --help                output usage information

Examples:

  $ json-mock-api --middleware ./middleware-1.js,./middleware-2.js
```

## The Json files

Given this file structure:

```
.
└── api/
    ├── login.json
    ├── user/
    │   └── 1.json
    └── users.json
```

That results in the following endpoints:

```
http://localhost:3000/api/login
http://localhost:3000/api/user/1
http://localhost:3000/api/users
```

## Handling different HTTP Verbs

You can specify a HTTP Verb in the json file name like so:

```
.
└── api/
    └── user/
        ├── 1.json
        ├── 1.post.json
        └── 1.put.json
```

When you access the endpoint `http://localhost:3000/api/user/1` via:
* a `POST` request, the file `./api/user/1.post.json` is returned
* a `PUT` request, the file `./api/user/1.put.json` is returned
* any other verb (`GET`, `DELETE`, ...), the file `./api/user/1.json` is returned

## Custom middleware

You can run your own [ExpressJS middleware](https://expressjs.com/en/guide/writing-middleware.html) 
if you want to.

To load your own middleware, use the `-m` or `--middleware` flags:

```bash
json-mock-api --middlware ./middlware-1.js,./middleware-2.js
```

The above command will load the files `middleware-1.js` and `middleware-2.js` 
from the current working directory and use them in this order when a request is
made before the response is send to the user.

You could use your own middleware to, for example, add authentication.

## Author

Peter Goes ([@petergoes](https://twitter.com/petergoes)) - [petergoes.nl](https://petergoes.nl)

## License

[MIT](LICENSE)
