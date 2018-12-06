import { oas } from '../src';
import * as path from 'path';

describe('Koa Oas3', () => {
  const mw = oas({
    file: path.resolve('./__tests__/fixtures/pet-store.json'),
    endpoint: '/openapi',
    uiEndpoint: '/openapi.html',
    validatePaths: ['/pets']
  });

  test('It should return raw Openapi doc with defined path', async () => {
    const ctx: any = {
      path: '/openapi'
    }
    const next = jest.fn();
    await mw(ctx, next);
    expect(next.mock.calls.length).toBe(0);
    expect(ctx.body.openapi).toBe('3.0.0');
  });

  test('It should return openapi UI page with defined path', () => {
    const ctx: any = {
      path: '/openapi.html'
    }

    const next = jest.fn();
    mw(ctx, next);
    expect(next.mock.calls.length).toBe(0);
    expect(ctx.body).toContain('<!DOCTYPE html>')
  })

  test('It should pass the middleware if validation passed', async () => {
    const ctx: any = {
      path: '/pets',
      request: {
        header: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: {
          id: 1,
          name: 'name',
          tag: 'tag'
        }
      }
    }
    const next = jest.fn();
    await mw(ctx, next);
    expect(next.mock.calls.length).toBe(1);
  })

  test('It should coerce values if validation passed', async () => {
    const ctx: any = {
      path: '/pets',
      request: {
        header: {
          'accept': 'application/json'
        },
        query: {
          limit: '10'
        },
        method: 'get'
      }
    };
    const next = jest.fn();
    await mw(ctx, next);
    expect(ctx.oas.request.query.limit).toBe(10);
  });

  test('It should throw ValidationError if validation failed', () => {
    const ctx: any = {
      path: '/pets',
      request: {
        header: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: {
          id: 1,
          tag: 'tag'
        }
      }
    }
    const next = jest.fn();
    return expect(mw(ctx, next)).rejects.toThrow();
  })

  test('Should custom error handler work', async () => {
    const ctx: any = {
      path: '/pets',
      request: {
        header: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: {
          id: 1,
          tag: 'tag'
        }
      }
    }
    const next = jest.fn();
    const errorHandler = jest.fn((err) => { throw err });
    const mw = oas({
      file: path.resolve('./__tests__/fixtures/pet-store.json'),
      endpoint: '/openapi',
      uiEndpoint: '/openapi.html',
      validatePaths: ['/pets'],
      errorHandler,
    });
    await expect(mw(ctx, next)).rejects.toThrow();
    expect(errorHandler).toBeCalled();
  })
})
