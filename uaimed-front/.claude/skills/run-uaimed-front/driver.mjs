#!/usr/bin/env node
// Minimal chromium-cli-style REPL driver for uaimed-front (Expo/React Native Web).
//
// Why this exists instead of chromium-cli: chromium-cli isn't installed in
// this environment. This is the documented fallback from the run skill's
// generator — a thin Playwright wrapper exposing the same small vocabulary
// (nav / wait-for / click / fill / screenshot / count / console-errors).
//
// Gotcha this driver works around: react-navigation's stack navigator keeps
// every visited screen mounted in the DOM on web (it just hides the old
// ones). A plain `text=` or CSS selector will therefore often match 2+
// elements — one on the current screen, one stale/hidden on a previous
// screen. Every lookup below filters to the first *visible* match instead
// of trusting `.first()` (DOM order), which picks the wrong element.
//
// Usage:
//   node driver.mjs <<'EOF'
//   nav http://localhost:8099
//   wait-for text=Criar conta
//   screenshot login
//   click text=Criar conta
//   EOF
//
// Commands (one per line, read from stdin):
//   nav <url>                     navigate
//   wait-for <selector>           poll (15s) until a VISIBLE match exists
//   click <selector>              click the first VISIBLE match
//   fill <selector> <value...>    fill the first VISIBLE match (selector = single token, no spaces, or 'quoted')
//   press <key>                   press a key (e.g. Enter) on the page
//   count <selector>              print how many VISIBLE matches exist
//   wait <ms>                     fixed pause (avoid — prefer wait-for)
//   screenshot [name]             save PNG, prints the path
//   console-errors                print captured console.error messages since last call
//   quit                          close the browser and exit
//
// <selector> accepts anything Playwright's page.locator() accepts:
// `text=Some text`, `[role="checkbox"]`, `input[placeholder="..."]`, etc.
// Append `::nth-visible=N` (0-indexed) to pick the Nth VISIBLE match when a
// selector matches more than one element with no other way to tell them
// apart (e.g. "Senha" vs "Confirmar Senha", both `input[type="password"]`).
//
// Screenshots land in ./screenshots/ next to this file (created on demand).

import { chromium } from 'playwright';
import { createInterface } from 'node:readline';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = join(__dirname, 'screenshots');

const consoleErrors = [];

// Selectors may end with `::nth-visible=N` (0-indexed) to disambiguate
// screens where N+1 visible elements match the same selector — e.g.
// CadastroScreen's "Senha" and "Confirmar Senha" are both
// `input[type="password"]` with no other distinguishing attribute.
// Not a Playwright feature — parsed by this driver before querying.
function parseOccurrence(selector) {
  const m = selector.match(/^(.*)::nth-visible=(\d+)$/);
  if (!m) return { selector, occurrence: 0 };
  return { selector: m[1], occurrence: Number(m[2]) };
}

async function findVisible(page, rawSelector, timeoutMs = 15000) {
  const { selector, occurrence } = parseOccurrence(rawSelector);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const loc = page.locator(selector);
    const count = await loc.count();
    let seen = 0;
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        if (seen === occurrence) return el;
        seen++;
      }
    }
    await page.waitForTimeout(200);
  }
  throw new Error(`timeout: no visible match #${occurrence} for selector: ${selector}`);
}

function stripQuotes(token) {
  if (token.startsWith("'") && token.endsWith("'") && token.length >= 2) {
    return token.slice(1, -1);
  }
  return token;
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 420, height: 950 } });
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const rl = createInterface({ input: process.stdin, terminal: false });

  for await (const raw of rl) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const spaceIdx = line.indexOf(' ');
    const cmd = spaceIdx === -1 ? line : line.slice(0, spaceIdx);
    const rest = spaceIdx === -1 ? '' : line.slice(spaceIdx + 1).trim();

    try {
      switch (cmd) {
        case 'nav': {
          await page.goto(rest, { waitUntil: 'domcontentloaded' });
          console.log(`ok nav ${rest}`);
          break;
        }
        case 'wait-for': {
          await findVisible(page, rest);
          console.log(`ok wait-for ${rest}`);
          break;
        }
        case 'click': {
          const el = await findVisible(page, rest);
          await el.click();
          console.log(`ok click ${rest}`);
          break;
        }
        case 'fill': {
          const m = rest.match(/^('[^']*'|\S+)\s*(.*)$/s);
          if (!m) throw new Error('usage: fill <selector> <value...>');
          const selector = stripQuotes(m[1]);
          const value = m[2];
          const el = await findVisible(page, selector);
          await el.fill(value);
          console.log(`ok fill ${selector}`);
          break;
        }
        case 'press': {
          await page.keyboard.press(rest);
          console.log(`ok press ${rest}`);
          break;
        }
        case 'count': {
          const loc = page.locator(parseOccurrence(rest).selector);
          const total = await loc.count();
          let visible = 0;
          for (let i = 0; i < total; i++) {
            if (await loc.nth(i).isVisible().catch(() => false)) visible++;
          }
          console.log(`count ${rest} -> total=${total} visible=${visible}`);
          break;
        }
        case 'wait': {
          await page.waitForTimeout(Number(rest) || 0);
          console.log(`ok wait ${rest}`);
          break;
        }
        case 'screenshot': {
          mkdirSync(SHOT_DIR, { recursive: true });
          const name = rest || `shot-${Date.now()}`;
          const path = join(SHOT_DIR, `${name}.png`);
          await page.screenshot({ path });
          console.log(`screenshot ${path}`);
          break;
        }
        case 'console-errors': {
          console.log(`console-errors (${consoleErrors.length}):`);
          consoleErrors.splice(0).forEach((e) => console.log(`  ${e}`));
          break;
        }
        case 'quit':
        case 'exit': {
          await browser.close();
          process.exit(0);
          break; // eslint-disable-line no-unreachable
        }
        default:
          console.log(`err unknown command: ${cmd}`);
      }
    } catch (err) {
      console.log(`err ${cmd}: ${err.message}`);
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error('driver crashed:', err);
  process.exit(1);
});
