import * as koa from 'koa';
import { Config, validateConfig } from './config';
import ChowChow, { ChowError } from 'oas3-chow-chow';
import { swaggerUI } from './swagger-ui';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as converter from 'swagger2openapi';
import * as compose from 'koa-compose';

export class ValidationError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
  }
}

export async function catchValidationError(ctx: koa.BaseContext, next: () => Promise<any>): Promise<void> {
  try {
    await next();
  } catch (e) {
    if (e instanceof ValidationError) {
      ctx.status = e.status;
      ctx.body = {
        message: e.message,
        code: e.status,
        details: e.details,
      };
    } else {
      throw e;
    }
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

    try {
      compiled.validateRequest(ctx.path, {
        method: ctx.request.method,
        header: ctx.request.header,
        query: ctx.request.query,
        path: ctx.params,
        cookie: ctx.cookies,
        body: ctx.request.body,
      })
    } catch (e) {
      if (e instanceof ChowError) {
        const json = e.toJSON();
        throw new ValidationError(json.message || 'Request validation error', json.code || 400, json);
      } else {
        throw new ValidationError('Request validation error', 400);
      }
    }

    await next();

    if (config.validateResponse) {
      try {
        compiled.validateResponse(ctx.path, {
          method: ctx.method,
          status: ctx.status,
          header: ctx.response.header,
          body: ctx.body
        })
      } catch(e) {
        if (e instanceof ChowError) {
          const json = e.toJSON();
          throw new ValidationError(json.message || 'Response validation error', 500, json);
        } else {
          throw new ValidationError('Response validation error', 500);
        }
      }
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
