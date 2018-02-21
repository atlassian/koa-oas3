export interface Config {
  swaggerFile: string;
  swaggerPath: string;
  swaggerUIPath: string;
  validateResponse: boolean;
  validatePaths: string[];
}

export function validateConfig(cfg: Partial<Config>): Config {
  if (!cfg.swaggerFile) {
    throw new Error('You must configure a Swagger file');
  }
  return {
    swaggerFile: cfg.swaggerFile,
    swaggerPath: cfg.swaggerPath || '/swagger.json',
    swaggerUIPath: cfg.swaggerUIPath || '/swagger.html',
    validateResponse: cfg.validateResponse || false,
    validatePaths: cfg.validatePaths || ['/'],
  };
}
