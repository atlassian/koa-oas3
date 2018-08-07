# koa-oas3
Request and Response validator for OpenAPI Specification 3.

# Installation
## npm
```
npm install --save koa-oas3
```
## yarn
```
yarn add koa-oas3
```

# API
The library would expect request body to be parsed under `ctx.request.body`. You can use `koa-bodyparser` package for that.

```ts
import * as bodyParser from 'koa-bodyparser';
import { oas } from 'koa-oas3';

export function oas3() {
  return compose([
    catchValidationError,
    oas({
      openapiFile: `${__dirname}/../openapi.yaml`,
      openapiPath: '/openapi.json',
      openapiUIPath: '/',
      validateResponse: false
    }),
  ]);
}

...

const app = new Koa();
app.use(bodyParser());
app.use(oas({
  openapiFile: `${__dirname}/../openapi.yaml`,
  openapiPath: '/openapi.json',
  openapiUIPath: '/'
}));

app.listen(8080);
```

## oas(option)

###options:

* `openapiFile` - The absolute path to your Openapi file
* `openapiPath`(default: /openapi.json) - The endpoint for serving Openapi JSON
* `openapiUIPath`:(default: /openapi.html) - The endpoint for serving Openapi UI
* `validateResponse`:(default: false) - Validate response against Openapi schemas
* `validatePaths`:(default ['/']) - Only endpoints starting with the values specified here will be validated
