export interface Config {
  openapiFile: string;
  openapiPath: string;
  openapiUIPath: string;
  validateResponse: boolean;
  validatePaths: string[];
}

export function validateConfig(cfg: Partial<Config>): Config {
  if (!cfg.openapiFile) {
    throw new Error('You must configure a Openapi File');
  }
  return {
    openapiFile: cfg.openapiFile,
    openapiPath: cfg.openapiPath || '/openapi.json',
    openapiUIPath: cfg.openapiUIPath || '/openapi.html',
    validateResponse: cfg.validateResponse || false,
    validatePaths: cfg.validatePaths || ['/'],
  };
}
