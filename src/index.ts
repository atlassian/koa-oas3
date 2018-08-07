import * as koa from 'koa';
import { Config, validateConfig } from './config';
import ChowChow, { ChowError } from 'oas3-chow-chow';
import { openapiUI } from './openapi-ui';
import * as compose from 'koa-compose';
import * as jsonfile from 'jsonfile';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

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

declare module 'koa' {
  interface Context {
    params?: any;
  }

  interface Request extends koa.BaseRequest {
    body?: any;
  }
}

export function oas<T extends koa.Context>(cfg: Partial<Config>): compose.Middleware<T> {

  const config = validateConfig(cfg);
  const { compiled, doc } = compileOas(config.openapiFile);

  return async (ctx: T, next: () => Promise<any>): Promise<void> => {

    if (ctx.path === config.openapiPath) {
      ctx.body = doc;
      return;
    }

    if (ctx.path === config.openapiUIPath) {
      ctx.body = openapiUI({
        title: doc.info ? doc.info.title : 'openapi UI',
        url: config.openapiPath,
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

function compileOas(file: string) {
  switch (true) {
    case file.endsWith('.json'): {
      const openApiObject = jsonfile.readFileSync(file);
      return {
        compiled: new ChowChow(openApiObject),
        doc: openApiObject,
      };
    }
    case file.endsWith('.yaml'):
    case file.endsWith('.yml'): {
      const openApiObject = yaml.safeLoad(fs.readFileSync('/home/ixti/example.yml', 'utf8'));
      return {
        compiled: new ChowChow(openApiObject),
        doc: openApiObject,
      };
    }
    default:
      throw new ValidationError('Unsupported file format', 500);
  }
}
