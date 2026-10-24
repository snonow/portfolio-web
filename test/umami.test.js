import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const __dirname = new URL('.', import.meta.url).pathname;

const ID = '276c28f6-0000-4000-8000-00000000000a'; // a made-up UUID: the real one lives in the Pages settings
const load = async () => import(`data:text/javascript,${encodeURIComponent(fs.readFileSync(`${__dirname}/../functions/st/[[path]].js`, 'utf8'))}`);
const call = async (fn, method, name, env) => fn({ request: new Request(`https://example.test/st/${name}`, { method, body: method === 'POST' ? '{}' : undefined, headers: { 'cf-connecting-ip': '203.0.113.9' } }), env, params: { path: name.split('/') } });

test('without UMAMI_HOST or a valid UMAMI_WEBSITE_ID the door sends nothing anywhere', async () => {
  const { onRequest } = await load();
  globalThis.fetch = () => { throw new Error('must not fetch'); };
  for (const env of [{}, { UMAMI_HOST: 'stats.example.test' }, { UMAMI_WEBSITE_ID: ID }, { UMAMI_HOST: 'stats.example.test', UMAMI_WEBSITE_ID: "x'});alert(1)//", UMAMI_RELAY_KEY: 'k' }, { UMAMI_HOST: 'stats.example.test', UMAMI_WEBSITE_ID: ID }]) {
    for (const name of ['s.js', 'u.js']) assert.strictEqual(await (await call(onRequest, 'GET', name, env)).text(), '');
    assert.strictEqual((await call(onRequest, 'POST', 'api/send', env)).status, 204);
  }
});

test('configured: only the tracker and the beacon are forwarded, with the visitor address and the relay key', async () => {
  const { onRequest } = await load();
  const seen = [];
  globalThis.fetch = async (url, init) => { seen.push([url, init.method, init.headers['x-visitor-ip'], Object.keys(init.headers).sort().join()]); return new Response('ok', { status: 202, headers: { 'set-cookie': 'a=b', 'x-relay-key': 'echo' } }); };
  const env = { UMAMI_HOST: 'stats.example.test', UMAMI_WEBSITE_ID: ID, UMAMI_RELAY_KEY: 'relay-secret-9' };
  const req = (method, name) => new Request(`https://example.test/st/${name}`, { method, body: method === 'POST' ? '{}' : undefined, headers: { 'cf-connecting-ip': '203.0.113.9', cookie: 'sid=1', authorization: 'Bearer x', 'x-forwarded-for': '6.6.6.6', 'x-visitor-ip': '6.6.6.6' } });
  const answers = [await onRequest({ request: req('GET', 'u.js'), env, params: { path: ['u.js'] } }), await onRequest({ request: req('POST', 'api/send'), env, params: { path: ['api', 'send'] } })];
  assert.deepStrictEqual(answers.map((r) => r.status), [202, 202]);
  assert.deepStrictEqual(seen, [
    ['https://stats.example.test/script.js', 'GET', '203.0.113.9', 'content-type,user-agent,x-relay-key,x-visitor-ip'],
    ['https://stats.example.test/api/send', 'POST', '203.0.113.9', 'content-type,user-agent,x-relay-key,x-visitor-ip'], // no cookie, no auth, a forged x-visitor-ip is overwritten
  ]);
  for (const r of answers) assert.ok(![...r.headers.keys()].some((k) => /cookie|relay/i.test(k)) && !JSON.stringify([...r.headers]).includes('relay-secret'), 'nothing from upstream or the secret comes back');
  assert.strictEqual((await call(onRequest, 'GET', 'api/send', env)).status, 404); // wrong method
  assert.ok(!/console\./.test(fs.readFileSync(`${__dirname}/../functions/st/[[path]].js`, 'utf8')), 'the door logs nothing');
  assert.strictEqual((await call(onRequest, 'GET', 'api/websites', env)).status, 404); // nothing else is reachable
  assert.strictEqual(seen.length, 2);
});

test('the bootstrap adds Umami\'s tag with this site\'s id, through our own origin, cookieless settings on', async () => {
  const { onRequest } = await load();
  const js = await (await call(onRequest, 'GET', 's.js', { UMAMI_HOST: 'stats.example.test', UMAMI_WEBSITE_ID: ID, UMAMI_RELAY_KEY: 'k' })).text();
  const added = [];
  new Function('document', 'location', js)({ createElement: () => ({ dataset: {} }), head: { appendChild: (s) => added.push(s) } }, { hostname: 'fudami.net', origin: 'https://fudami.net' });
  const [s] = added;
  assert.deepStrictEqual([s.defer, s.src, s.dataset.websiteId, s.dataset.hostUrl, s.dataset.domains, s.dataset.doNotTrack, s.dataset.excludeSearch],
    [true, '/st/u.js', ID, 'https://fudami.net/st', 'fudami.net', 'true', 'true']);
  assert.ok(!js.includes('stats.example.test'), 'the stats host never reaches the browser');
});

test('the loader runs on production only, off for localhost, previews, Do Not Track and GPC, no external host', () => {
  const src = fs.readFileSync(`${__dirname}/../src/main.jsx`, 'utf8');
  const block = src.match(/const \{ hostname \} = window\.location\n[\s\S]*?\n\}\n/)[0];
  const run = (host, nav) => {
    const added = [];
    new Function('window', 'navigator', 'document', block)({ location: { hostname: host } }, nav, { createElement: () => ({}), head: { appendChild: (s) => added.push(s) } });
    return added;
  };
  const [s] = run('example.test', {});
  assert.deepStrictEqual([s.defer, s.src], [true, '/st/s.js']);
  for (const host of ['localhost', '127.0.0.1', 'abc.portfolio-web.pages.dev']) assert.strictEqual(run(host, {}).length, 0, host);
  assert.strictEqual(run('example.test', { doNotTrack: '1' }).length, 0);
  assert.strictEqual(run('example.test', { globalPrivacyControl: true }).length, 0);
  assert.ok(!/https?:\/\//.test(block), 'no external host in the loader');
});

test('the legal page has the statistics switch on Umami\'s own opt-out key, in EN, FR and JA', () => {
  const src = fs.readFileSync(`${__dirname}/../scripts/prerender.mjs`, 'utf8');
  assert.strictEqual((src.match(/class="stats-switch"/g) || []).length, 3);
  const script = src.match(/<script>\n([\s\S]*?)\n {4}<\/script>/)[1];
  const store = {};
  const buttons = [1, 2, 3].map(() => ({ dataset: { offLabel: 'off?', onLabel: 'on?' }, textContent: '', addEventListener(_, f) { this.click = f; } }));
  new Function('document', 'localStorage', script)(
    { querySelectorAll: () => ({ forEach: (f) => buttons.forEach(f) }) },
    { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } },
  );
  assert.ok(buttons.every((b) => b.textContent === 'off?'));
  buttons[0].click();
  assert.strictEqual(store['umami.disabled'], '1');
  assert.ok(buttons.every((b) => b.textContent === 'on?'));
  buttons[1].click();
  assert.strictEqual(store['umami.disabled'], undefined);
});
