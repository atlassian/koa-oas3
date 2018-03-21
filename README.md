# koa-oas3
Request and Response validator for OpenAPI Specification 3.

# Usage
The library would expect request body to be parsed under `ctx.request.body`. You can use `koa-bodyparser` package for that.

```js
import { oas, catchValidationError } from 'koa-oas3';

export async function oas3(): Promise<Router.IMiddleware> {
  return compose([
    catchValidationError,
    await oas<Router.IRouterContext>({
      swaggerFile: `${__dirname}/../swagger.yaml`,
      swaggerPath: '/swagger.json',
      swaggerUIPath: '/',
      validateResponse: false
    }),
  ]);
}

...

const app = new Koa();
app.use(await oas3());
```
