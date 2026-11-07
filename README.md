# Ti fagame pali

A small [SolidJS](https://solidjs.com) app for splitting a bill: add the people who ate, add each food item with its price and who shared it, and get a shareable link showing what everyone owes.

## Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | `v26.13.0` (see [`.nvmrc`](.nvmrc)) | Vite 7 needs at least 20.19 or 22.12 |
| pnpm | `12.16.1` | Same version CI uses |

## Local setup

### 1. Install Node with nvm

If you don't have [nvm](https://github.com/nvm-sh/nvm) yet, install it first. Then, from the repo folder:

```bash
nvm install   # reads .nvmrc and installs that Node version
nvm use       # switches the current shell to it
node -v       # should print v26.13.0
```

### 2. Install pnpm

Install pnpm for that Node version:

```bash
npm i -g pnpm@12.16.1
pnpm -v       # should print 12.16.1
```

> With nvm, global packages belong to one Node version. If you switch Node versions later, install pnpm again.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run the dev server

```bash
pnpm dev
```

Open <http://localhost:3000/ti-fagame-pali/>. The `/ti-fagame-pali/` path is required because Vite's `base` is set for GitHub Pages. The page reloads when you save a file.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm start` | Starts the dev server on port 3000 |
| `pnpm test` | Runs the test suite once (also runs in CI before every deploy) |
| `pnpm test:watch` | Re-runs the tests as you edit |
| `pnpm build` | Builds for production into the `root/` folder |
| `pnpm serve` | Serves the production build locally, so you can check it before deploying |
| `pnpm run deploy` | Publishes `root/` to the `gh-pages` branch manually. Use `run` here, because plain `pnpm deploy` is a different built-in pnpm command |

## Share links

"Share with the table" saves the bill to a small Cloudflare Worker ([`worker/`](worker/)) backed by Workers KV and copies a short link like `…/ti-fagame-pali/#k3x9pq2a`. Links expire after 30 days.

- The app finds the Worker through `VITE_SHARE_API_URL`: [`.env.development`](.env.development) points at the local Worker, [`.env.production`](.env.production) at the deployed one.
- If the Worker can't be reached, sharing shows an error and nothing is lost: the bill stays on screen so you can try again.

| Command | What it does |
| --- | --- |
| `pnpm api:dev` | Runs the Worker locally on <http://localhost:8787> with a local KV store |
| `pnpm api:deploy` | Deploys the Worker to Cloudflare |

To work on sharing locally, run `pnpm api:dev` and `pnpm dev` in two terminals.

## Deployment

The Worker is deployed separately with `pnpm api:deploy`. For the site, every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It builds the app with pnpm 12 and the Node version in `.nvmrc`, then publishes it to GitHub Pages:

<https://don-galak.github.io/ti-fagame-pali/>

## Troubleshooting

**`You are using Node.js 18.x` or `crypto.hash is not a function` when running `pnpm dev`**

pnpm is running Vite on an old Node version, even if `node -v` shows the right one. pnpm starts scripts with the Node it is running on itself, so check:

```bash
which -a pnpm        # should point into ~/.nvm/versions/node/v26.13.0/bin
pnpm exec node -v    # the Node your scripts actually get
```

If `pnpm` resolves to a shim from another version manager (for example `~/.asdf/shims/pnpm`), remove that copy (`asdf plugin remove pnpm`), then install pnpm again with npm as in step 2 and run `hash -r`.

**`Password authentication is not supported` when pushing**

GitHub no longer accepts account passwords for Git over HTTPS. Log in with the GitHub CLI (`gh auth login` and then `gh auth setup-git`), or use a personal access token or an SSH key instead.
