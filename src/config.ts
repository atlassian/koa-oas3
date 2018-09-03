export interface Config {
  /**
   * Absolute path to Openapi Document
   */
  file: string;
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
  swaggerUi: string;
}

export function validateConfig(cfg: Partial<Config>): Config {
  if (!cfg.file) {
    throw new Error('You must configure a Openapi File');
  }
  return {
    file: cfg.file,
    endpoint: cfg.endpoint || '/openapi.json',
    uiEndpoint: cfg.uiEndpoint || '/openapi.html',
    validateResponse: cfg.validateResponse || false,
    validatePaths: cfg.validatePaths || ['/'],
    swaggerUi: cfg.swaggerUi || '//unpkg.com/swagger-ui-dist@3'
  };
}
