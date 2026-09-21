#!/usr/bin/env node
// Person 2 handoff: registers ai/outputs/metrics.json + artifact PNGs as a model card.
// Usage: node scripts/register_model.js <metrics.json> [--email a@x] [--password p] [--api http://localhost:5001/api]
// ponytail: plain node + fetch (Node 20 global), no new deps.
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const metricsPath = args[0];
if (!metricsPath) {
  console.error('Usage: node scripts/register_model.js <metrics.json> [--email E] [--password P] [--api URL]');
  process.exit(1);
}
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const email = opt('--email', process.env.ADMIN_EMAIL || 'admin@drishti.ai');
const password = opt('--password', process.env.ADMIN_PASSWORD || 'Admin@123');
const api = (opt('--api', process.env.API_URL || 'http://localhost:5001/api')).replace(/\/$/, '');

(async () => {
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const version = metrics.modelVersion;
  if (!version) throw new Error('metrics.json must contain modelVersion');
  const srcDir = path.dirname(path.resolve(metricsPath));
  const destDir = path.resolve(__dirname, '..', 'uploads', 'model', version);
  fs.mkdirSync(destDir, { recursive: true });

  // Copy co-located PNGs; rewrite artifact URLs to served paths
  const pngs = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith('.png'));
  const pick = (re) => pngs.find((f) => re.test(f.toLowerCase()));
  const cm = pick(/confusion|matrix/) || pngs[0];
  const roc = pick(/roc/) || pngs[1] || cm;
  const cal = pick(/calibr/) || pngs[2] || cm;
  const copy = (f) => {
    if (!f) return null;
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
    return `/uploads/model/${version}/${f}`;
  };
  metrics.artifacts = {
    confusionMatrixUrl: copy(cm),
    rocUrl: copy(roc),
    calibrationUrl: copy(cal),
  };

  const login = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());
  if (!login.success) throw new Error(`Admin login failed: ${login.error}`);
  const res = await fetch(`${api}/model/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.data.token}` },
    body: JSON.stringify(metrics),
  }).then((r) => r.json());
  if (!res.success) throw new Error(`Register failed: ${JSON.stringify(res)}`);
  console.log(`Registered model ${version}; targets.met = ${res.data.model.referableMetrics.targets.met}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
