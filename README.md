# 🏈 The Gauntlet

High-stakes fantasy football platform with advanced simulation, dynamic scoring
systems, and tightly integrated game mechanics.

## Project Structure

```
gauntlet-website/
├── apps/
│   ├── web/          # Next.js frontend application and API
│   ├── api/          # Data ingestion and processing scripts
│   └── sim-engine/   # Fantasy simulation CLI and service
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── lib/          # Utility functions and helpers
│   └── models/       # Business logic and domain models
├── brand/
│   ├── logo.svg      # Brand assets
│   ├── fonts/        # Typography files
│   └── colors.ts     # Color system
└── docs/
    ├── architecture.md
    ├── league-format.md
    └── simulation-notes.md
```

## Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **PostgreSQL**: v14 or higher (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/gauntlet-website
cd gauntlet-website

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Start development servers
pnpm dev
```

This will start:

- **Web App**: http://localhost:3000

### Development Commands

```bash
# Start all applications in development mode
pnpm dev

# Build all packages and applications
pnpm build

# Run linting across all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

## Applications

### 🌐 Web App (`apps/web`)

Next.js 14 application with:

- Modern React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- API routes for backend logic

```bash
cd apps/web
pnpm dev  # Start at localhost:3000
```

### 🔌 Data Ingestion (`apps/api`)

A collection of Node.js scripts for:

- Ingesting data from various sources
- Processing and storing data in PostgreSQL
- Running data analysis scripts

```bash
# Run data ingestion scripts
pnpm --filter @gauntlet/api -- <script_name>
```

### 🎯 Simulation Engine (`apps/sim-engine`)

Advanced fantasy football simulation system:

```bash
# Run test simulation
pnpm --filter @gauntlet/sim-engine sim:test

# Simulate full season
pnpm --filter @gauntlet/sim-engine sim:season

# Simulate specific matchup
pnpm --filter @gauntlet/sim-engine sim:matchup --team1 team_123 --team2 team_456
```

## Packages

### 📋 Types (`packages/types`)

Shared TypeScript definitions for:

- Player and team interfaces
- League settings and scoring systems
- API response types
- Simulation results

### 🔧 Lib (`packages/lib`)

Utility functions including:

- Scoring calculations
- Data validation
- Helper functions
- Constants and configurations

### 🏗️ Models (`packages/models`)

Business logic models for:

- League management
- Team operations
- Player statistics
- Game simulations

## Technology Stack

- **Frontend/Backend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo**: pnpm workspaces + Turbo
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (frontend and backend)

## Tech Debt

This section tracks known technical debt and areas for improvement.

- [ ] **Consolidate API Logic**: The backend logic is currently split between
      `apps/api` (data ingestion) and `apps/web` (API routes). This should be
      consolidated into a single, dedicated backend service.
- [ ] **Add a UI Package**: A shared `ui` package should be created to house
      common React components, reducing code duplication between applications.
- [ ] **Improve Test Coverage**: The current test coverage is low. More
      comprehensive tests (unit, integration, and end-to-end) should be added to
      ensure code quality and prevent regressions.
- [ ] **Refactor Data Ingestion**: The data ingestion scripts in `apps/api`
      should be refactored for better error handling, logging, and
      configurability.
- [ ] **Standardize API Responses**: The API responses should follow a
      consistent format to simplify client-side data handling.

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pnpm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Quality

This project maintains high code quality standards:

- **TypeScript**: Strict type checking across all packages
- **ESLint**: Consistent code style and error detection
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates
- **Jest**: Comprehensive test coverage

## Deployment

### Production Build

```bash
# Build all packages and applications
pnpm build
```

### Vercel Deployment

The web app is configured for automatic deployment to Vercel:

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join project discussions for questions and ideas

---

Built with ❤️ for fantasy football enthusiasts who demand the best tools for
their high-stakes leagues.
