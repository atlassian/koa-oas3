import * as koa from 'koa';
import { Config, validateConfig } from './config';
import ChowChow, { ChowError, RequestValidationError, ResponseValidationError } from 'oas3-chow-chow';
import { openapiUI } from './openapi-ui';
import * as jsonfile from 'jsonfile';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as oasValidator from 'oas-validator';
import * as compose from 'koa-compose';
import * as qs from 'qs';
import * as util from 'util';

export { ChowError, RequestValidationError, ResponseValidationError };

const readFile = util.promisify(fs.readFile);

type RequestWithBody = koa.BaseRequest & {
  body?: any;
};

export type Oas = {
  request: {
    query?: any;
    header?: any;
    params?: any;
  };
  operationId?: any;
}

declare module 'koa' {
  interface Context {
    oas?: Oas;
  }
}


export async function oas(cfg: Partial<Config>): Promise<koa.Middleware> {

  const config = validateConfig(cfg);
  const { compiled, doc } = await compileOas(config);

  const validatorMW: koa.Middleware = async (ctx: koa.Context & { params?: any }, next: () => Promise<any>): Promise<void> => {
    try {
      const validRequest = compiled.validateRequestByPath(ctx.path, ctx.request.method, {
        header: ctx.request.header,
        query: qs.parse(ctx.request.querystring, config.qsParseOptions),
        path: ctx.params,
        cookie: ctx.cookies,
        body: (ctx.request as RequestWithBody).body,
      });

      // Store coerced values
      ctx.oas = {
        request: {
          query: validRequest.query,
          params: validRequest.path,
          header: validRequest.header,
        },
        operationId: validRequest.operationId
      };

    } catch (err) {
      config.errorHandler(err, ctx);
    }

    await next();

    if (config.validateResponse) {
      try {
        compiled.validateResponseByPath(ctx.path, ctx.method, {
          status: ctx.status,
          header: ctx.response.header,
          body: ctx.body
        })
      } catch(err) {
        config.errorHandler(err, ctx);
      }
    }
  };

  const composedMW: koa.Middleware = async (ctx: koa.Context & { params?: any }, next: () => Promise<any>): Promise<void> => {
    if (config.enableUi && ctx.path === config.endpoint) {
      ctx.body = doc;
      return;
    }

    if (config.enableUi && ctx.path === config.uiEndpoint) {
      ctx.body = openapiUI({
        title: doc.info ? doc.info.title : 'openapi UI',
        url: config.endpoint,
        swaggerUiBundleBasePath: config.swaggerUiBundleBasePath
      });
      return;
    }

    if (!config.validatePaths.some(path => ctx.path.startsWith(path))) {
      // Skip validation if no path matches
      return next();
    }

    const middlewares: Array<koa.Middleware> = [];
    const requestContentTypes = compiled.getDefinedRequestBodyContentType(ctx.path, ctx.request.method);
    const matchedContentType = ctx.request.is(requestContentTypes);
    if (requestContentTypes.length && config.requestBodyHandler && matchedContentType && typeof matchedContentType === 'string') {
      // We need to find the most specific matched handler
      const parts = matchedContentType.split('/');
      if (config.requestBodyHandler[matchedContentType]) {
        middlewares.push(config.requestBodyHandler[matchedContentType]);  // For a specific match like `application/json`
      } else if (config.requestBodyHandler[`${parts[0]}/*`]) {
        middlewares.push(config.requestBodyHandler[`${parts[0]}/*`]);  // For a match like `application/*`
      } else if (config.requestBodyHandler[`*/${parts[1]}`]) {
        middlewares.push(config.requestBodyHandler[`*/${parts[1]}`]);  // For a match like `*/json`
      } else if (config.requestBodyHandler['*/*']) {
        middlewares.push(config.requestBodyHandler['*/*']);  // For a global type match defined as `*/*`
      }
    }

    middlewares.push(validatorMW);
    await compose(middlewares).call(this, ctx, next);
  }

  return composedMW;
}

async function loadFromFile(file?: string): Promise<any> {
    if (!file) {
        throw new Error("Missing file path");
    }
    switch (true) {
        case file.endsWith('.json'): {
            return jsonfile.readFile(file);
        }
        case file.endsWith('.yml') || file.endsWith('.yaml'): {
            return yaml.safeLoad(await readFile(file, { encoding: 'utf8' }));
        }
        default:
            throw new Error('Unsupported file format');
    }
}

async function compileOas(config: Config) {
  let openApiObject: any = config.spec || await loadFromFile(config.file);
  try {
    await oasValidator.validateInner(openApiObject, config.oasValidatorOptions || {});
  } catch (err) {
    throw new Error('Invalid Openapi document' + err.message);
  }

  return {
    compiled: new ChowChow(openApiObject, config.validationOptions),
    doc: openApiObject,
  };
}
