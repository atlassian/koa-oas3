# koa-oas3
Request and Response validator for OpenAPI Specification 3.

# Usage
```js
async function oasErrors(ctx: koa.Context, next: () => Promise<any>): Promise<void> {
  try {
    await next();
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Request validation failed',
      details: {
        where: e.where,
        name: e.key,
        message: e.message,
      },
    };
  }
}

export async function oas3(): Promise<Router.IMiddleware> {
  return compose([
    oasErrors,
    await oas<Router.IRouterContext>({
      swaggerFile: `${__dirname}/../swagger.yaml`,
      swaggerPath: '/swagger.json',
      swaggerUIPath: '/',
    }),
  ]);
}

...

const app = new Koa();
app.use(await oas3());
```
