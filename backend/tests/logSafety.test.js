const pino = require('pino');
const { Writable } = require('stream');
// eslint-disable-next-line global-require
const { loggerOptions } = require('../src/utils/logger');

test('pino redacts Bearer tokens and cookies from logs', (done) => {
  let out = '';
  const sink = new Writable({
    write(chunk, enc, cb) {
      out += chunk.toString();
      cb();
    },
  });
  const log = pino(loggerOptions, sink);
  log.info({ req: { headers: { authorization: 'Bearer super-secret-token', cookie: 'sess=abc' } } }, 'login attempt');
  sink.on('finish', () => {
    expect(out).not.toMatch(/super-secret-token/);
    expect(out).not.toMatch(/sess=abc/);
    expect(out).toMatch(/Redacted/);
    done();
  });
  sink.end();
});

test('logger config carries redact paths', () => {
  expect(loggerOptions.redact.join(' ')).toMatch(/authorization/);
});
