import * as koa from 'koa';
import { Config, validateConfig } from './config';
import ChowChow, { ChowError } from 'oas3-chow-chow';
import { openapiUI } from './openapi-ui';
import * as jsonfile from 'jsonfile';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as oasValidator from 'oas-validator';

type RequestWithBody = koa.BaseRequest & {
  body?: any;
};

export function oas(cfg: Partial<Config>): koa.Middleware {

  const config = validateConfig(cfg);
  const { compiled, doc } = compileOas(config.file);

  const mw: koa.Middleware = async (ctx: koa.Context & { params?: any }, next: () => Promise<any>): Promise<void> => {

    if (ctx.path === config.endpoint) {
      ctx.body = doc;
      return;
    }

    if (ctx.path === config.uiEndpoint) {
      ctx.body = openapiUI({
        title: doc.info ? doc.info.title : 'openapi UI',
        url: config.endpoint,
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
        body: (ctx.request as RequestWithBody).body,
      })
    } catch (err) {
      if (err instanceof ChowError) {
        const json = err.toJSON();
        ctx.throw(400, 'Request validation error', { expose: true, ...json });
      } else {
        throw err;
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
      } catch(err) {
        if (err instanceof ChowError) {
          const json = err.toJSON();
          ctx.throw(400, 'Response validation error', { expose: true, ...json });
        } else {
          throw err;
        }
      }
    }
  };
  return mw;
}

function compileOas(file: string) {
  let openApiObject: any;
  switch (true) {
    case file.endsWith('.json'): {
      openApiObject = jsonfile.readFileSync(file);
      break;
    }
    case file.endsWith('.yaml'):
    case file.endsWith('.yml'): {
      openApiObject = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
      break;
    }
    default:
      throw new Error('Unsupported file format');
  }
  if (!oasValidator.validateSync(openApiObject, {})) {
    throw new Error('Invalid Openapi document');
  }
  return {
    compiled: new ChowChow(openApiObject),
    doc: openApiObject,
  };
}
