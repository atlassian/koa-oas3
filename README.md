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
By default, this library will use `koa-bodyparser` to parse request body. See config of `requestBodyHandler`.

```ts
import * as bodyParser from 'koa-bodyparser';
import { oas } from 'koa-oas3';

const app = new Koa();
app.use(bodyParser());
const oasMw = await oas({
  file: `${__dirname}/../openapi.yaml`,
  endpoint: '/openapi.json',
  uiEndpoint: '/'
})
app.use(oasMw);

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
* `validationOptions`: Optional - options for sending to oas3-chow-chow/AJV
* `oasValidatorOptions`: Optional - options for sending to oas-validator. https://github.com/Mermade/oas-kit/blob/main/docs/options.md
* `qsParseOptions: { [key: string]: any}`: Optional - Options to be passed to the [query string](https://github.com/ljharb/qs) parse command. Default: `{ comma: true }`
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

## Contributors

Pull requests, issues and comments welcome. For pull requests:

* Add tests for new features and bug fixes
* Follow the existing style
* Separate unrelated changes into multiple pull requests
* See the existing issues for things to start contributing.
* Generate changeset using `yarn changeset`
* If there are dependency changes, update lock file with `yarn install`

For bigger changes, make sure you start a discussion first by creating an issue and explaining the intended change.

Atlassian requires contributors to sign a Contributor License Agreement, known as a CLA. This serves as a record stating that the contributor is entitled to contribute the code/documentation/translation to the project and is willing to have it used in distributions and derivative works (or is willing to transfer ownership).

Prior to accepting your contributions we ask that you please follow the appropriate link below to digitally sign the CLA. The Corporate CLA is for those who are contributing as a member of an organization and the individual CLA is for those contributing as an individual.

* [CLA for corporate contributors](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=e1c17c66-ca4d-4aab-a953-2c231af4a20b)
* [CLA for individuals](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=3f94fbdc-2fbe-46ac-b14c-5d152700ae5d)
