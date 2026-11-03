import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../api/stats.js', import.meta.url), 'utf8');
const { default: handler } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
for (const [name, cookie, metric, shouldHit] of [
  ['first visitor increments', '', 'visits', true],
  ['returning visitor only reads', 'other=1; portfolio_visited=1', 'visits', false],
  ['likes remain independent', 'portfolio_visited=1', 'likes', true],
]) {
  test(name, async (t) => {
    let endpoint;
    t.mock.method(globalThis, 'fetch', async url => { endpoint = url; return { ok: true, json: async () => ({ value: 101 }) }; });
    const res = { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(s) { this.code=s; return this; }, json(body) { this.body=body; return this; } };
    await handler({ method:'GET', query:{type:'increment',metric}, headers:{cookie,'x-forwarded-proto':'https'} },res);
    assert.equal(endpoint.includes('/hit/'),shouldHit);
    assert.equal(res.body.count,101);
    if(metric==='visits') assert.match(res.headers['Set-Cookie'],/HttpOnly; SameSite=Lax; Secure/);
  });
}
test('upstream failure does not mark the visitor counted', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ok:false}));
  const res = { headers:{}, setHeader(k,v) {this.headers[k]=v;}, status(s) {this.code=s;return this;}, json(body) {this.body=body;} };
  await handler({method:'GET',query:{type:'increment',metric:'visits'},headers:{}},res);
  assert.equal(res.code,502);
  assert.equal(res.headers['Set-Cookie'],undefined);
});
