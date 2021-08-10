import * as path from 'path';
import * as bodyParser from 'koa-bodyparser';
import { ChowOptions } from 'oas3-chow-chow';
import * as koa from 'koa';

import { oas } from '../src';
import { createContext } from './helpers/createContext';

describe('Koa Oas3', () => {
  let mw: koa.Middleware;

  beforeAll(async () => {
    mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      validationOptions: { requestBodyAjvOptions: { allErrors: true } } as ChowOptions
    });
  })

  test('It should throw error if invalid Openapi document is passed', async () => {
    return expect(oas({
      file: path.resolve('./__tests__/fixtures/broken.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      validationOptions: { requestBodyAjvOptions: { allErrors: true } } as ChowOptions
    })).rejects.toThrow('Invalid Openapi document');
  })

  test('It should return raw Openapi doc with defined path', async () => {
    const ctx = createContext({
      url: '/openapi',
      method: 'GET'
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(next.mock.calls.length).toBe(0);
    expect(ctx.body.openapi).toBe('3.0.0');
  });

  test('It should return openapi UI page with defined path', async () => {
    const ctx = createContext({
      url: '/openapi.html',
      method: 'GET'
    });

    const next = jest.fn();
    await mw(ctx, next);
    expect(next.mock.calls.length).toBe(0);
    expect(ctx.body).toContain('<!DOCTYPE html>');
  });

  test('It should pass the middleware if validation passed', async () => {
    const ctx = createContext({
      url: '/pets',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: {
        id: 1,
        name: 'name',
        tag: 'tag'
      }
    });

    const next = jest.fn();
    await mw(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('It should coerce values if validation passed', async () => {
    const ctx = createContext({
      url: '/pets?limit=10&type[color]=red&fields=name,age,breed',
      headers: {
        'accept': 'application/json'
      },
      method: 'GET'
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas!.request.query.limit).toBe(10);
    expect(ctx.oas!.request.query.type).toEqual({color: 'red'});
    expect(ctx.oas!.request.query.fields).toEqual(['name','age','breed']);
  });

  test('It should parse out operationId for GET', async() => {
    const ctx = createContext({
      url: '/pets?limit=10&type[color]=red&fields=name,age,breed',
      headers: {
        'accept': 'application/json'
      },
      method: 'GET'
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas!.operationId).toEqual('listPets');
  });

  test('It should parse out operationId for POST', async() => {
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas!.operationId).toEqual('createPets');
  });

  test('It should parse out operationId for PUT', async() => {
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'audio/aac'
      },
      method: 'PUT'
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas!.operationId).toEqual('createEmptyPets');
  });

  describe('Throw ValidationError', () => {
    test('Is should throw ValidationError if validation failed for object type query params', () => {
        const ctx = createContext({
            url: '/pets?type[color]=grey',
            headers: {
              'accept': 'application/json'
            },
            method: 'GET'
          });
          const next = jest.fn();
          return expect(mw(ctx, next)).rejects.toThrow();
    });
    test('It should throw ValidationError if validation failed', () => {
        const ctx = createContext({
          url: '/pets',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          method: 'POST',
          body: {
            id: 1,
            tag: 'tag'
          }
        });
        const next = jest.fn();
        return expect(mw(ctx, next)).rejects.toThrow();
      });
  });

  test('Should custom error handler work', async () => {
    const next = jest.fn();
    const errorHandler = jest.fn((err) => { throw err });
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      errorHandler,
    });
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag'
      }
    });

    await expect(mw(ctx, next)).rejects.toThrow();
    expect(errorHandler).toBeCalled();
  });

  test('It should pick the correct body handler for content type', async () => {
    const next = jest.fn();
    const bodyHandler = jest.fn().mockImplementation(bodyParser({
      extendTypes: {
        json: ['application/json']
      },
      enableTypes: ['json']
    }));
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      requestBodyHandler: {
        'application/json': bodyHandler
      }
    });
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    await expect(mw(ctx, next)).resolves.toEqual(undefined);
    expect(bodyHandler).toBeCalled();
  });

  test('It should pick the most specific body handler for content type', async () => {
    const next = jest.fn();
    const bodyHandler = jest.fn().mockImplementation(bodyParser({
      extendTypes: {
        json: ['application/json']
      },
      enableTypes: ['json']
    }));
    const anotherBodyHandler = jest.fn();
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      requestBodyHandler: {
        'application/json': bodyHandler,
        'application/*': anotherBodyHandler
      }
    });
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    await expect(mw(ctx, next)).resolves.toEqual(undefined);
    expect(bodyHandler).toHaveBeenCalled();
    expect(anotherBodyHandler).not.toHaveBeenCalled();
  });

  test('It should not pick any body handler if it is NOT defined in the schema', async () => {
    const ctx = createContext({
      url: '/pets/123',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/xml'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    const next = jest.fn();
    const bodyHandler = jest.fn().mockImplementation(bodyParser({
      extendTypes: {
        json: ['application/xml']
      },
      enableTypes: ['json']
    }));
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      requestBodyHandler: {
        'application/xml': bodyHandler,
      }
    });
    await expect(mw(ctx, next)).resolves.toEqual(undefined);
    expect(bodyHandler).not.toHaveBeenCalled();
  });

  test('It should not pick any body handler if the body schema is empty', async () => {
    const ctx = createContext({
      url: '/pets/123',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'PUT',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    const next = jest.fn();
    const bodyHandler = jest.fn().mockImplementation(bodyParser({
      extendTypes: {
        json: ['application/json']
      },
      enableTypes: ['json']
    }));
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      requestBodyHandler: {
        'application/json': bodyHandler,
      }
    });
    await expect(mw(ctx, next)).resolves.toEqual(undefined);
    expect(bodyHandler).not.toHaveBeenCalled();
  });

  test('It should not pick any body handler if it is NOT defined in the config', async () => {
    const ctx = createContext({
      url: '/pets/123',
      headers: {
        'accept': 'application/json',
        'content-type': 'audio/aac'
      },
      method: 'PUT',
      body: {
        id: 1,
        tag: 'tag',
        name: 'name'
      }
    });
    const next = jest.fn();
    const bodyHandler = jest.fn().mockImplementation(bodyParser({
      extendTypes: {
        json: ['application/json']
      },
      enableTypes: ['json']
    }));
    const mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      requestBodyHandler: {
        'application/json': bodyHandler,
      }
    });
    await expect(mw(ctx, next)).resolves.toEqual(undefined);
    expect(bodyHandler).not.toHaveBeenCalled();
  });
})

describe('Koa Oas3 with ChowOptions', () => {
  let mw: koa.Middleware;

  beforeAll(async () => {
    mw = await oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/'],
      validationOptions: { requestBodyAjvOptions: { allErrors: true } } as ChowOptions
    });
  })

  test('It should coerce values if validation passed', async () => {
    const ctx = createContext({
      url: '/pets?limit=10',
      headers: {
        'accept': 'application/json'
      },
      method: 'GET'
    });
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas!.request.query.limit).toBe(10);
  });

  test('It should throw ValidationError if validation failed', () => {
    const ctx = createContext({
      url: '/pets',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: {
        id: 1,
        tag: 'tag'
      }
    });
    const next = jest.fn();
    return expect(mw(ctx, next)).rejects.toThrow();
  })

  test('ctx.oas.request.params populated with path param if validation passed', async () => {
    const pathParam = 345;

    const ctx = createContext({
      url: `/pets/${pathParam}`,
      headers: {
        'accept': 'application/json'
      },
      method: 'GET'
    });
    const next = jest.fn();
    await mw(ctx, next);
    console.log(`ctx.oas: ${JSON.stringify(ctx.oas)}`)
    expect(ctx.oas!.request.params.petId).toBe(pathParam);
  });

})
