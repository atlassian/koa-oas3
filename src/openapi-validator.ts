import * as Ajv from 'ajv';
import * as jsonSchemaDraftV4 from 'ajv/lib/refs/json-schema-draft-04.json';
// The schema is copied from https://github.com/OAI/OpenAPI-Specification/blob/master/schemas/v3.0/schema.json
import * as openapiSchema from './openapi-schema.json';

const ajv = new Ajv({ schemaId: 'auto', allErrors: true });
ajv.addMetaSchema(jsonSchemaDraftV4);
const validator = ajv.compile(openapiSchema);

export function validate(json: any) {
  return validator(json);
}
