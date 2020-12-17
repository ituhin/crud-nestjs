import { Request } from 'express';

export function requestedUrl(req: Request, removeParams: Array<string>): string {
  let url = req.protocol + "://" + req.get('host') + req.path;
  const queries = req.query;
  removeParams.forEach(key => {
    if(queries[key]) delete queries[key];
  })

  return url +'?'+ objectToParams(queries);
}

export function objectToParams(data) {
  return Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
}