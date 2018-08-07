import { oas, ValidationError } from '../src';
import * as Sinon from 'sinon';
import * as path from 'path';

describe('Koa Oas3', () => {
  const mw = oas({
    openapiFile: path.resolve('./__tests__/fixtures/pet-store.json'),
    openapiPath: '/openapi',
    openapiUIPath: '/openapi.html',
    validatePaths: ['/pets']
  });

  afterEach(() => {
    Sinon.restore();
  })

  test('It should return raw Openapi doc with defined path', () => {
    const ctx: any = {
      path: '/openapi'
    }
    const next = Sinon.spy();
    mw(ctx, next);
    expect(next.notCalled).toBe(true);
    expect(ctx.body.openapi).toBe('3.0.0');
  });

  test('It should return openapi UI page with defined path', () => {
    const ctx: any = {
      path: '/openapi.html'
    }

    const next = Sinon.spy();
    mw(ctx, next);
    expect(next.notCalled).toBe(true);
    expect(ctx.body).toContain('<!DOCTYPE html>')
  })

  test('It should pass the middleware if validation passed', () => {
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
    const next = Sinon.spy();
    mw(ctx, next);
    expect(next.calledOnce).toBe(true);
  })

  test('It should throw ValidationError if validation failed', async () => {
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
    const next = Sinon.spy();
    expect(mw(ctx, next)).rejects;
  })
})
