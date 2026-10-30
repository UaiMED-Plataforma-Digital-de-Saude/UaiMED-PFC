---
name: run-uaimed-front
description: Build, run, and drive the uaimed-front Expo/React Native app (web target) headlessly. Use when asked to start uaimed-front, launch the app, screenshot a screen, or click/fill/navigate through it to verify a UI change.
---

uaimed-front is an Expo/React Native app. It has no native build step for
the scenario this skill covers — it's driven through its **web** target
(`expo start --web`, backed by `react-native-web`) with a headless
Chromium controlled by `.claude/skills/run-uaimed-front/driver.mjs`, a
small Playwright-based REPL (chromium-cli isn't installed in this
environment; this driver is the documented fallback with the same
command vocabulary).

All paths below are relative to `uaimed-front/` (this skill's grandparent
directory).

## Prerequisites

No extra OS packages were needed in this container — `chromium.launch({
args: ['--no-sandbox'] })` ran out of the box. If you hit missing shared
library errors on a different machine, try `npx playwright install-deps`.

```bash
# Node — whatever this repo already uses (nvm, etc). No special version needed for this skill.
```

## Setup

`playwright` is a committed devDependency (added for this skill) —
`npm install` pulls it in. The Chromium *browser binary* is a separate
download, cached outside node_modules:

```bash
npm install
npx playwright install chromium   # downloads Chromium to ~/.cache/ms-playwright (~280MB, one-time)
```

### Backend dependency

The app calls the API at `http://localhost:3333/api` (see
`config/index.ts` → `CONFIG.API.development`). Nothing renders
meaningfully without it running:

```bash
cd ../uaimed-back && docker compose up -d
timeout 60 bash -c 'until curl -sf http://localhost:3333/api/health >/dev/null; do sleep 2; done'
cd ../uaimed-front
```

`docker compose up -d` on an already-running stack is a no-op; `docker
compose ps` to check first if unsure.

## Build

No separate build step for the web target — Metro compiles on the fly
when the dev server is hit.

## Run (agent path)

1. Start the dev server in the background on a fixed port (8081 is
   Expo's default and often busy; this skill uses 8099 throughout):

   ```bash
   CI=1 EXPO_NO_TELEMETRY=1 nohup npx expo start --web --port 8099 > /tmp/expo-web.log 2>&1 &
   echo $! > /tmp/expo-web.pid
   timeout 60 bash -c 'until curl -sf http://localhost:8099 >/dev/null; do sleep 2; done'
   ```

2. Drive it with the REPL driver — pipe commands to stdin, one per line:

   ```bash
   node .claude/skills/run-uaimed-front/driver.mjs <<'EOF'
   nav http://localhost:8099
   wait-for text=Criar conta
   screenshot login
   quit
   EOF
   ```

   Screenshots land in
   `.claude/skills/run-uaimed-front/screenshots/<name>.png` (gitignored —
   they're run artifacts, not committed).

3. Stop the dev server when done: `kill $(cat /tmp/expo-web.pid)` (or
   `pkill -f 'expo start --web'`).

### Driver commands

| command | what it does |
|---|---|
| `nav <url>` | navigate |
| `wait-for <selector>` | poll up to 15s until a **visible** match exists |
| `click <selector>` | click the first visible match |
| `fill <selector> <value...>` | fill the first visible match. Selector is a single token — wrap in `'single quotes'` if it contains spaces (e.g. a `placeholder="..."` with spaces inside) |
| `press <key>` | keyboard press (e.g. `Enter`) |
| `count <selector>` | print total vs. visible match counts |
| `wait <ms>` | fixed pause — prefer `wait-for` |
| `screenshot [name]` | save PNG, prints the path |
| `console-errors` | print and clear captured `console.error` calls |
| `quit` / `exit` | close the browser |

`<selector>` is anything `page.locator()` accepts (`text=...`, CSS). Append
`::nth-visible=N` (0-indexed, driver-specific, not a Playwright feature)
to pick the Nth visible match when a selector is ambiguous — see Gotchas.

### Worked example (verified this session)

Reaches the Cadastro (signup) screen as a patient and exercises its LGPD
consent checkbox: blocks submit without consent, opens the policy-text
modal, then checks the box.

```bash
node .claude/skills/run-uaimed-front/driver.mjs <<'EOF'
nav http://localhost:8099
wait-for text=Criar conta
click text=Criar conta
wait-for text=Sou Paciente
click text=Sou Paciente
click text=Próximo
wait-for text=Cadastro de Paciente
fill 'input[placeholder="Ex: João Silva"]' Smoke Driver
fill 'input[placeholder="000.000.000-00"]' 11122233344
fill 'input[placeholder="exemplo@email.com"]' smoke.driver@example.com
fill 'input[placeholder="(31) 99999-9999"]' 31988887777
fill input[type="password"]::nth-visible=0 senha123
fill input[type="password"]::nth-visible=1 senha123
click text=CADASTRAR
wait-for text=Consentimento necessário
screenshot sem-consentimento
click text=OK
click text=Política de Privacidade (LGPD)
wait-for text=A UaiMED coleta e trata seus dados pessoais
screenshot modal-politica
click text=Fechar
click [role="checkbox"]
screenshot checkbox-marcado
console-errors
quit
EOF
```

To reach a logged-in area (e.g. a clinic/médico dashboard), fill the
login form instead and submit — there's no URL deep-linking configured
(`nav`ing straight to a screen's "path" doesn't work; see Gotchas).

## Run (human path)

```bash
npm run web   # → expo start --web, opens a real browser tab. Ctrl-C to stop.
```

## Test

No automated test suite exists in `uaimed-front` (no `test` script, no
`*.test.*` files) as of this writing. The backend (`uaimed-back`) has a
real vitest suite — see its own docs.

## Gotchas

- **Every visited screen stays mounted.** react-navigation's stack
  navigator (web) hides old screens rather than unmounting them, so a
  `text=` or CSS selector frequently matches 2+ elements — one live, one
  stale on a screen behind it. The driver's `wait-for`/`click`/`fill`
  already filter to the first **visible** match; don't use raw
  `page.locator(...).first()` logic if you extend this driver, it picks
  DOM order, not visibility.
- **No distinguishing attribute for duplicate visible fields.**
  CadastroScreen's "Senha" and "Confirmar Senha" are both
  `input[type="password"]` with no placeholder/name to tell them apart,
  and both are visible at once. Use `::nth-visible=0` / `::nth-visible=1`
  (see worked example).
- **No URL deep-linking.** There's no `linking` config on the
  `NavigationContainer`, so `nav http://localhost:8099/cadastro` just
  reloads the login screen. Click through the real flow (see worked
  example) to reach a given screen.
- **Quoting in `fill`.** The selector token is parsed before the value;
  if the selector contains a space (e.g.
  `input[placeholder="Ex: João Silva"]`), wrap the *whole selector* in
  single quotes: `fill 'input[placeholder="Ex: João Silva"]' value here`.
  Forgetting the quotes silently truncates the selector at the first
  space and fails with a CSS parse error.
- **Port 8081 clashes.** Expo's default web port is 8081, which is also
  Metro's native-bundler port and gets reused across tool sessions. This
  skill pins `--port 8099` to avoid colliding with an already-running
  instance.

## Troubleshooting

- **`locator.count: Error while parsing css selector "'input[placeholder=...". Did you mean to CSS.escape it?`**
  — the `fill` selector had an internal space but wasn't (or was
  incorrectly) single-quoted. Quote the entire selector token.
- **`wait-for` times out on a modal/text you can see should be there** —
  usually means an earlier step failed silently (e.g. a `fill` error
  left a required field empty, so the app showed a *different* modal
  first, like "Campos obrigatórios" instead of the one you're waiting
  for). Re-run with a `screenshot` right before the failing `wait-for`
  to see the actual state.
- **App loads but every screen shows a network-error state** — the
  backend isn't up. `curl -sf http://localhost:3333/api/health` — if
  that fails, `cd ../uaimed-back && docker compose up -d`.
