# json-mock-api

Mock an api with plain json files

## Usage

Without installing

```bash
npx json-mock-api --port 3000 --directory .
```

or 

Add to your project...

```bash
npm install --save json-mock-api
```

... then add update your package.json ...

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
