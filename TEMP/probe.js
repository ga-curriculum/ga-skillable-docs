// probe.js: send requests and report what came back (Modules 3 and 4).
//
// Copy this file into your api/ folder (Lab 3.1, Step 2). It's built into your API image, so you run it inside your
// own namespace with kubectl exec, and the same command works on Windows, Mac and Linux:
//
//   kubectl exec -n YOUR_NAMESPACE deploy/meme-api -- node probe.js --target legacy --sweep 1,2,4,8,16 --step 15
//   kubectl exec -n YOUR_NAMESPACE deploy/meme-api -- node probe.js --target api --concurrency 2 --duration 720 --report 30
//
// Module 4 runs the same file from a course image, in a pod of its own, so it keeps running while releases replace
// your API pods:
//
//   kubectl run probe -n YOUR_NAMESPACE --rm -i --restart=Never --quiet --image=europe-west2-docker.pkg.dev/ga-lloyds-sre/meme-generator-repo/probe:v1 -- --target service --rate 1 --duration 60
//
// Options:
//   --target legacy|api|service
//                         legacy: the legacy template store directly. api: your own API's generate endpoint, from
//                         inside the API pod. service: your API through its Service, from any pod in your namespace.
//                         With service, every request opens a new connection, so the Service shares requests across
//                         your API pods in proportion to how many there are, the way many separate callers would.
//                         The other targets reuse connections, and Kubernetes balances connections, not requests
//   --url URL             any other URL instead of --target
//   --concurrency N       clients sending at once, each waiting for its answer before sending again (default 1)
//   --rate R              instead of --concurrency: send R requests a second, on a fixed schedule, whether or not
//                         earlier requests have answered. Decimals allowed, for example 0.5
//   --duration S          seconds to run (default 30)
//   --sweep a,b,c         run once at each concurrency in turn, for --step seconds each (default 15)
//   --report S            with --duration, also print a line every S seconds
//   --mode MODE           X-Failure-Mode header to send to the API (default none)
//   --error-every N       send X-Failure-Mode: error on every Nth request instead, an error rate of 1 in N
//
// An option or target this file doesn't recognise stops it with an error, before it sends anything.
//
// Every result line shows: concurrency (or rate), requests completed, throughput per second, good answers per second
// (HTTP 2xx with RC=00, or with no RC at all), p50, p95 and max latency in ms, HTTP status codes, and RC codes, read
// from the legacy text or from the API's JSON if either carries one. Report lines start with the time, in UTC.
// Traffic from this script is not tagged in any way. Think about where it ends up in your SLI.

const args = process.argv.slice(2);
const opt = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
if (args.includes('-h') || args.includes('--help')) {
    console.log(require('fs').readFileSync(__filename, 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n'));
    process.exit(0);
}

const TARGETS = {
    legacy: { url: 'http://legacy-template-store/cics/TMPL', method: 'POST' },
    api: { url: 'http://localhost:3000/api/memes/generate', method: 'POST' },
    service: { url: 'http://meme-api-service/api/memes/generate', method: 'POST' },
};

// Refuse anything this file doesn't understand, rather than quietly running with defaults. An option that is ignored
// sends traffic somewhere other than where you think, and the output can look like an outage.
const fail = (message) => {
    console.error(`probe: ${message}. Run with --help to see the options.`);
    process.exit(2);
};
const OPTIONS = ['target', 'url', 'concurrency', 'rate', 'duration', 'sweep', 'step', 'report', 'mode', 'error-every'];
for (let i = 0; i < args.length; i += 1) {
    const name = args[i].startsWith('--') ? args[i].slice(2) : null;
    if (!OPTIONS.includes(name)) fail(`unknown option '${args[i]}'`);
    if (args[i + 1] === undefined || args[i + 1].startsWith('--')) fail(`--${name} needs a value`);
    i += 1;
}
if (opt('target', null) !== null && !TARGETS[opt('target')]) {
    fail(`unknown target '${opt('target')}', use ${Object.keys(TARGETS).join(', ')} or --url`);
}
for (const name of ['concurrency', 'rate', 'duration', 'step', 'report', 'error-every']) {
    const value = opt(name, null);
    if (value !== null && !(Number(value) >= 0)) fail(`--${name} must be a number, not '${value}'`);
}
if (opt('concurrency', null) !== null && !(Number.isInteger(Number(opt('concurrency'))) && Number(opt('concurrency')) >= 1)) {
    fail('--concurrency must be a whole number, 1 or more');
}
const target = TARGETS[opt('target', 'api')];
const url = opt('url', target.url);
const mode = opt('mode', 'none');
const errorEvery = Number(opt('error-every', 0));
const TIMEOUT_MS = 15000;
// --target service only: a new connection for every request (see the header).
const freshConnection = opt('target', 'api') === 'service' && opt('url', null) === null;

function percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function rcOf(body) {
    const text = body.match(/RC=(\d\d)/);
    if (text) return text[1];
    try {
        const json = JSON.parse(body);
        const found = JSON.stringify(json).match(/"rc":"([A-Za-z0-9]+)"/);
        if (found) return found[1];
    } catch (e) { /* not JSON */ }
    return '-';
}

// One request on a connection of its own, closed afterwards, with the same overall timeout as fetch below.
function fresh(failureMode) {
    return new Promise((resolve, reject) => {
        const req = require('http').request(url, {
            method: target.method,
            agent: false,
            headers: { 'X-Failure-Mode': failureMode, 'Content-Length': 0, Connection: 'close' },
        }, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => { clearTimeout(timer); resolve({ status: res.statusCode, body }); });
            res.on('error', (e) => { clearTimeout(timer); reject(e); });
        });
        const timer = setTimeout(() => req.destroy(new Error('timeout')), TIMEOUT_MS);
        req.on('error', (e) => { clearTimeout(timer); reject(e); });
        req.end();
    });
}

async function one(failureMode = mode) {
    const started = Date.now();
    try {
        if (freshConnection) {
            const res = await fresh(failureMode);
            return { ms: Date.now() - started, status: String(res.status), rc: rcOf(res.body) };
        }
        const res = await fetch(url, {
            method: target.method,
            headers: { 'X-Failure-Mode': failureMode },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        const body = await res.text();
        return { ms: Date.now() - started, status: String(res.status), rc: rcOf(body) };
    } catch (e) {
        return { ms: Date.now() - started, status: 'ERR', rc: '-' };
    }
}

function summarise(results, concurrency, seconds) {
    if (typeof concurrency === 'number' && !Number.isInteger(concurrency)) concurrency = concurrency.toFixed(1);
    const ms = results.map((r) => r.ms).sort((a, b) => a - b);
    const count = (key) => {
        const c = {};
        results.forEach((r) => { c[r[key]] = (c[r[key]] || 0) + 1; });
        return Object.keys(c).sort().map((k) => `${k}:${c[k]}`).join(' ') || '-';
    };
    const tput = seconds > 0 ? results.length / seconds : 0;
    const good = results.filter((r) => r.status.startsWith('2') && (r.rc === '00' || r.rc === '-')).length;
    const goodput = seconds > 0 ? good / seconds : 0;
    return [
        String(concurrency).padStart(4),
        String(results.length).padStart(6),
        tput.toFixed(1).padStart(7),
        goodput.toFixed(1).padStart(7),
        String(percentile(ms, 50)).padStart(6),
        String(percentile(ms, 95)).padStart(6),
        String(ms.length ? ms[ms.length - 1] : 0).padStart(6),
        `  http ${count('status')}`,
        `  rc ${count('rc')}`,
    ].join('');
}

const HEADER = 'conc  reqs  tput/s  good/s  p50ms  p95ms  maxms';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let current = null;   // the run in progress, so an interrupted run can still print what it has

// With rate > 0, requests go out on a fixed schedule (open loop). Otherwise `concurrency` clients each send, wait for
// the answer, and send again (closed loop).
async function run(concurrency, seconds, reportEvery, rate = 0) {
    const label = rate > 0 ? rate : concurrency;
    const deadline = Date.now() + seconds * 1000;
    const all = [];
    let window = [];
    let windowStart = Date.now();
    let reporter = null;
    let sent = 0;
    const started = Date.now();
    current = { all, label, started };
    if (reportEvery > 0) {
        reporter = setInterval(() => {
            const now = Date.now();
            const clock = new Date(now).toISOString().slice(11, 19);
            console.log(`${clock} ${summarise(window, label, (now - windowStart) / 1000)}`);
            window = [];
            windowStart = now;
        }, reportEvery * 1000);
    }
    const send = async () => {
        sent += 1;
        const failureMode = errorEvery > 0 && sent % errorEvery === 0 ? 'error' : mode;
        const r = await one(failureMode);
        all.push(r);
        window.push(r);
    };
    if (rate > 0) {
        const total = Math.max(1, Math.round(rate * seconds));
        const pending = [];
        for (let i = 0; i < total; i += 1) {
            const wait = started + (i * 1000) / rate - Date.now();
            if (wait > 0) await sleep(wait);
            pending.push(send());
        }
        await Promise.all(pending);
    } else {
        const client = async () => {
            while (Date.now() < deadline) await send();
        };
        await Promise.all(Array.from({ length: concurrency }, client));
    }
    if (reporter) clearInterval(reporter);
    current = null;
    return summarise(all, label, (Date.now() - started) / 1000);
}

// Ctrl+C, or the pod being deleted: print the total so far, then stop.
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        if (current) {
            console.log(`stopped  ${summarise(current.all, current.label, (Date.now() - current.started) / 1000)}`);
        }
        process.exit(130);
    });
}

(async () => {
    const extras = [];
    if (url.includes('/api/')) extras.push(`mode=${mode}`);
    if (errorEvery > 0) extras.push(`error-every=${errorEvery}`);
    console.log(`probe ${url}${extras.length ? ` ${extras.join(' ')}` : ''}`);
    const sweep = opt('sweep', null);
    if (sweep) {
        const step = Number(opt('step', 15));
        console.log(HEADER);
        for (const c of sweep.split(',').map(Number).filter((n) => n > 0)) {
            console.log(await run(c, step, 0));
        }
    } else {
        const rate = Number(opt('rate', 0));
        const concurrency = Number(opt('concurrency', 1));
        const duration = Number(opt('duration', 30));
        const report = Number(opt('report', 0));
        const header = rate > 0 ? HEADER.replace('conc', 'rate') : HEADER;
        console.log(report > 0 ? `time     ${header}` : header);
        const total = await run(concurrency, duration, report, rate);
        console.log(report > 0 ? `total    ${total}` : total);
    }
})();
