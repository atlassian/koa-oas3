import * as Koa from 'koa';
import * as httpMock from 'node-mocks-http';
import { Duplex } from 'stream';

const app = new Koa();
export function createContext(req: httpMock.RequestOptions, res?: httpMock.ResponseOptions): Koa.Context {
  if (req.body) {
    req.headers = {
      ...(req.headers || {}),
      'content-length': `${JSON.stringify(req.body).length}`
    }
  }
  const mockedReq = httpMock.createRequest(req as any);
  const mockedRes = httpMock.createResponse(res as any);

  // Some functions we call in the implementations will perform checks for `req.encrypted`, which delegates to the socket.
  // MockRequest doesn't set a fake socket itself, so we create one here.
  mockedReq.socket = new Duplex() as any;
  Object.defineProperty(mockedReq.socket, 'encrypted', {
    writable: false,
    value: false,
  });

  if (req.body) {
    /**
     * .send() method will emit the data event straight away, however,
     * we want it to be fired only after we have attached all the event
     * listerners.
     */ 
    process.nextTick(() => {
      mockedReq.send(req.body);
    })
  }

  const ctx = app.createContext(mockedReq, mockedRes);
  return ctx;
}

