# Local Development Setup

Complete guide for setting up the Gauntlet monorepo on your local machine.

## Prerequisites

| Tool                                  | Version  | Required | Notes                                       |
| ------------------------------------- | -------- | -------- | ------------------------------------------- |
| [Node.js](https://nodejs.org/)        | ≥ 18.0.0 | Yes      | LTS recommended                             |
| [pnpm](https://pnpm.io/)              | ≥ 9.0.0  | Yes      | Package manager (see install below)         |
| [Git](https://git-scm.com/)           | Latest   | Yes      | For cloning                                 |
| [PostgreSQL](https://postgresql.org/) | 14+      | Optional | Only for `apps/server` historical snapshots |

### Installing pnpm

If you don't have pnpm installed:

```bash
# Using Homebrew (macOS)
brew install pnpm

# Using npm
npm install -g pnpm

# Using corepack (Node 16.10+)
corepack enable
corepack prepare pnpm@latest --activate
```

Verify installation:

```bash
pnpm --version  # Should be ≥ 9.0.0
```

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gauntlet-website
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies across the monorepo using pnpm workspaces.

### 3. Configure Environment Variables

The web app works without environment variables for basic development, but some
features require configuration.

#### For `apps/web` (optional)

Create `apps/web/.env.local`:

```bash
# Optional: Gemini API for AI-generated recaps
# GEMINI_API_KEY=your_key_here
```

#### For `apps/server` (only if using historical snapshots)

Create `apps/server/.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/gauntlet
```

Then set up the database:

```bash
pnpm --filter @gauntlet/server prisma:generate
pnpm --filter @gauntlet/server prisma:migrate
```

### 4. Start Development Server

```bash
# Start the web app only (most common)
pnpm --filter @gauntlet/web dev

# Or start all apps in parallel
pnpm dev
```

The web app will be available at `http://localhost:3000`.

## Common Commands

### Development

| Command                             | Description                        |
| ----------------------------------- | ---------------------------------- |
| `pnpm dev`                          | Start all apps in development mode |
| `pnpm --filter @gauntlet/web dev`   | Start web app only                 |
| `pnpm --filter @gauntlet/web build` | Build web app for production       |
| `pnpm --filter @gauntlet/web start` | Start web app (production build)   |

### Code Quality

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `pnpm lint`         | Run ESLint across all packages |
| `pnpm lint:fix`     | Fix auto-fixable ESLint issues |
| `pnpm type-check`   | Run TypeScript type checking   |
| `pnpm format`       | Format code with Prettier      |
| `pnpm format:check` | Check code formatting          |

### Testing

| Command                                   | Description                 |
| ----------------------------------------- | --------------------------- |
| `pnpm test`                               | Run all test suites         |
| `pnpm --filter @gauntlet/web test`        | Run web app tests           |
| `pnpm --filter @gauntlet/web test:watch`  | Run tests in watch mode     |
| `pnpm --filter @gauntlet/sim-engine test` | Run simulation engine tests |

### Background Jobs (requires PostgreSQL)

| Command                                          | Description                |
| ------------------------------------------------ | -------------------------- |
| `pnpm --filter @gauntlet/server live-snapshot`   | Capture live odds snapshot |
| `pnpm --filter @gauntlet/server audit:db`        | Audit database usage       |
| `pnpm --filter @gauntlet/server prisma:generate` | Generate Prisma client     |
| `pnpm --filter @gauntlet/server prisma:migrate`  | Run database migrations    |

### Utility Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `pnpm inspect:sleeper`  | Inspect Sleeper API data |
| `pnpm calculate-report` | Calculate report data    |
| `pnpm clean`            | Clean build artifacts    |

## Troubleshooting

### Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm --filter @gauntlet/web dev -- --port 3001
```

### pnpm Not Found

**Error:** `command not found: pnpm`

**Solution:**

Ensure pnpm is installed and in your PATH:

```bash
# Install via npm
npm install -g pnpm

# Or use corepack
corepack enable
```

### Node Version Mismatch

**Error:** `Engine node is incompatible`

**Solution:**

Use a Node version manager to install Node ≥ 18:

```bash
# Using nvm
nvm install 18
nvm use 18

# Using fnm
fnm install 18
fnm use 18
```

### DATABASE_URL Errors

**Error:** `DATABASE_URL is required` when running server jobs

**Solution:**

1. Ensure PostgreSQL is installed and running
2. Create a database: `createdb gauntlet`
3. Set `DATABASE_URL` in `apps/server/.env`
4. Run migrations: `pnpm --filter @gauntlet/server prisma:migrate`

### Module Not Found Errors

**Error:** `Cannot find module '@gauntlet/types'`

**Solution:**

```bash
# Reinstall dependencies
pnpm install

# Build packages first
pnpm --filter @gauntlet/types build
pnpm --filter @gauntlet/lib build
```

### Type Errors After Pull

**Solution:**

```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm type-check
```

## Workspace Structure

```
apps/
  web/              # Next.js 14 app (main UI)
  server/           # Background jobs (requires PostgreSQL)
  sim-engine/       # Monte Carlo simulation engine
packages/
  types/            # Shared TypeScript types
  lib/              # Shared utilities
  ui/               # Shared UI components
  tokens/           # Design tokens
```

## Next Steps

- Read [`apps/web/README.md`](../apps/web/README.md) for web app details
- Read [`apps/server/README.md`](../apps/server/README.md) for background jobs
- Check out [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) for system overview
- See [`docs/AGENTS.md`](AGENTS.md) for development guidelines

## Getting Help

- Check existing documentation in `docs/`
- Review module READMEs in `apps/*/README.md` and `packages/*/README.md`
- Look for patterns in existing code before adding new features
