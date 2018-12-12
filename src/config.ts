import { ChowError } from 'oas3-chow-chow';
import { Context } from 'koa';

export interface Config {
  /**
   * Absolute path to Openapi Document
   */
  file?: string;
  /**
   * Openapi document as a javascript object
   */
  spec?: object,
  /**
   * Endpoint that serves raw Openapi Document in JSON
   * default: /openapi.json
   */
  endpoint: string;
  /**
   * Endpoint that serves Openapi UI
   * default: /openapi.html
   */
  uiEndpoint: string;
  /**
   * Validate the response
   */
  validateResponse: boolean;
  /**
   * Whitelist paths for request validation
   * default: ['/']
   */
  validatePaths: string[];

  /**
   * Optional base path to swagger ui bundle
   */
  swaggerUiBundleBasePath: string;

  /**
   * Optional custom error handler
   */
  errorHandler: (error: Error, ctx: Context)=> void,
}

function defaultErrorHandler(err: Error, ctx: Context) {
  if (err instanceof ChowError) {
    const json = err.toJSON();
    ctx.throw(400, err.message, { expose: true, ...json });
  }
  throw err;
}

export function validateConfig(cfg: Partial<Config>): Config {
  if (!cfg.file && !cfg.spec) {
    throw new Error('You must configure a Openapi File or a OpenAPIObject object');
  }
  return {
    file: cfg.file,
    spec: cfg.spec,
    endpoint: cfg.endpoint || '/openapi.json',
    uiEndpoint: cfg.uiEndpoint || '/openapi.html',
    validateResponse: cfg.validateResponse || false,
    validatePaths: cfg.validatePaths || ['/'],
    swaggerUiBundleBasePath: cfg.swaggerUiBundleBasePath || '//unpkg.com/swagger-ui-dist@3/',
    errorHandler: cfg.errorHandler || defaultErrorHandler,
  };
}
