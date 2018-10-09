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
import { oas, catchValidationError } from 'koa-oas3';

export function oas3() {
  return compose([
    catchValidationError,
    oas({
      file: `${__dirname}/../openapi.yaml`,
      endpoint: '/openapi.json',
      uiEndpoint: '/'
    }),
  ]);
}

...

const app = new Koa();
app.use(bodyParser());
app.use(oas3());

app.listen(8080);
```

## oas(option)

### options:

* `file` - The absolute path to your Openapi file
* `endpoint`(default: /openapi.json) - The endpoint for serving Openapi JSON
* `uiEndpoint`:(default: /openapi.html) - The endpoint for serving Openapi UI
* `validateResponse`:(default: false) - Validate response against Openapi schemas
* `validatePaths`:(default ['/']) - Only endpoints starting with the values specified here will be validated
* `swaggerUiBundleBasePath`: (default use swagger-ui-dist from [unpkg](https://unpkg.com/)) - [swaggerUiAssetPath](https://www.npmjs.com/package/swagger-ui-dist) needed for loading the swagger-ui
