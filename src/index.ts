import * as koa from 'koa';
import { Config, validateConfig } from './config';
import ChowChow from 'oas3-chow-chow';
import { swaggerUI } from './swagger-ui';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as converter from 'swagger2openapi';
import * as compose from 'koa-compose';

export class ValidationError extends Error {
  constructor(message: string, public status: number, public validationErrors?: any[]) {
    super(message);
  }
}

export async function oas<T extends koa.BaseContext>(cfg: Partial<Config>): Promise<compose.Middleware<T>> {

  const config = validateConfig(cfg);
  const { compiled, doc } = await compileOas(config.swaggerFile);

  return async (ctx: T, next: () => Promise<any>): Promise<void> => {

    if (ctx.path === config.swaggerPath) {
      ctx.body = doc;
      return;
    }

    if (ctx.path === config.swaggerUIPath) {
      ctx.body = swaggerUI({
        title: doc.info ? doc.info.title : 'Swagger UI',
        url: config.swaggerPath,
      });
      return;
    }

    if (!config.validatePaths.some(path => ctx.path.startsWith(path))) {
      // Skip validation if no path matches
      return await next();
    }

    compiled.validateRequest(ctx.path, {
      method: ctx.request.method,
      header: ctx.request.header,
      query: ctx.request.query,
      path: ctx.params,
      cookie: ctx.cookies
    })

    await next();

    if (config.validateResponse) {
      //TODO: Adds support to valiadteResponse
      throw new Error('Validate response is under development... :)');
      // const error = swagger.validateResponse(compiledPath, ctx.method, ctx.status, ctx.body);
      // if (error) {
      //   throw new ValidationError(`Response validation failed`, 500, [error]);
      // }
    }
  };
}

async function compileOas(file: string) {
  // Convert Swagger to OAS
  const { openapi } = await converter.convertFile(file, {});

  return {
    compiled: new ChowChow(openapi),
    doc: openapi,
  };
}
