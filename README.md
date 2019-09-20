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

const app = new Koa();
app.use(bodyParser());
app.use(oas({
  file: `${__dirname}/../openapi.yaml`,
  endpoint: '/openapi.json',
  uiEndpoint: '/'
});

app.listen(8080);
```

## oas(option)

### options:

* `file` - The absolute path to your Openapi file
* `spec` - javascript object defining the api, either this or `file` must be given.
* `enableUi`(default: true) - Whether to enable serving Openapi JSON and UI
* `endpoint`(default: /openapi.json) - The endpoint for serving Openapi JSON
* `uiEndpoint`:(default: /openapi.html) - The endpoint for serving Openapi UI
* `validateResponse`:(default: false) - Validate response against Openapi schemas
* `validatePaths`:(default ['/']) - Only endpoints starting with the values specified here will be validated
* `swaggerUiBundleBasePath`: (default use swagger-ui-dist from [unpkg](https://unpkg.com/)) - [swaggerUiAssetPath](https://www.npmjs.com/package/swagger-ui-dist) needed for loading the swagger-ui
* `errorHandler: (error: Error, ctx: Context) => void,`: Optional - custom error hanlder.
* `requestBodyHandler: { [key: string]: koa.Middleware }`: Optional - custom body handler. Defaults:
```
{
  'application/json': bodyParser({
    extendTypes: {
      json: ['application/json']
    },
    enableTypes: ['json']
  }),
  'text/*': bodyParser({
    extendTypes: {
      text: ['text/*']
    },
    enableTypes: ['text']
  }),
  'application/x-www-form-urlencoded': bodyParser({
    extendTypes: {
      form: ['application/x-www-form-urlencoded']
    },
    enableTypes: ['form']
  })
}
```
