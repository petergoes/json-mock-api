# json-mock-api

Mock an api with plain json files.

## Usage

Without installing

```bash
npx json-mock-api --port 3000 --directory .
```

or 

Add to your `json-mock-api` project ...

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
* a POST request, the file `./api/user/1.post.json` is returned
* a PUT request, the file `./api/user/1.put.json` is returned
* any other verb (GET, DELETE, ...), the file `./api/user/1.json` is returned



## Author

Peter Goes ([@petergoes](https://twitter.com/petergoes)) - [petergoes.nl](https://petergoes.nl)