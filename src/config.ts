import { ChowError, ChowOptions } from 'oas3-chow-chow';
import * as bodyParser from 'koa-bodyparser';
import { Context, Middleware } from 'koa';

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
   * Whether to enable OpenAPI UI display and OpenAPI doc display
   */
  enableUi?: boolean,
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
  /**
   * Body handlers to different request content-types
   * default:
   * {
   *  'application/json': bodyParser.json(),
      'text/*': bodyParser.text({ type: 'text/*'}),
      'application/x-www-form-urlencoded': bodyParser.urlencoded({extended: true})
   * }
   */
  requestBodyHandler?: {
    [key: string]: Middleware
  };
  /**
   * Optional options for sending to oas3-chow-chow/AJV
   */
  validationOptions?: Partial<ChowOptions>;
  qsParseOptions?: qs.IParseOptions;
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
    enableUi: cfg.enableUi !== undefined ? cfg.enableUi : true,
    endpoint: cfg.endpoint || '/openapi.json',
    uiEndpoint: cfg.uiEndpoint || '/openapi.html',
    validateResponse: cfg.validateResponse || false,
    validatePaths: cfg.validatePaths || ['/'],
    swaggerUiBundleBasePath: cfg.swaggerUiBundleBasePath || '//unpkg.com/swagger-ui-dist@3/',
    errorHandler: cfg.errorHandler || defaultErrorHandler,
    qsParseOptions: cfg.qsParseOptions || { comma: true },
    requestBodyHandler: cfg.requestBodyHandler || {
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
    },
    validationOptions: cfg.validationOptions
  };
}
