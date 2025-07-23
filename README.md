# 🏈 The Gauntlet

High-stakes fantasy football platform with advanced simulation, dynamic scoring systems, and tightly integrated game mechanics.

## Features

- **Advanced Simulation Engine**: AI-powered player projections and matchup analysis
- **Real-time Data Pipeline**: Live stats from multiple sources with automated ingestion
- **Dynamic Scoring Systems**: Customizable scoring with weather, matchup, and situational adjustments
- **League Management**: Complete fantasy league administration with trade analysis
- **Modern UI/UX**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Project Structure

```
gauntlet-website/
├── apps/
│   ├── web/          # Next.js frontend application
│   ├── api/          # Express.js backend API
│   ├── sim-engine/   # Fantasy simulation CLI and service
│   ├── scraper/      # Data scraping and ingestion service
│   └── admin/        # Admin dashboard (optional)
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── lib/          # Utility functions and helpers
│   ├── models/       # Business logic and domain models
│   └── ui/           # Shared React components
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
- **API Server**: http://localhost:3001
- **Simulation Engine**: Available via CLI commands

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
- Real-time updates via WebSockets

```bash
cd apps/web
pnpm dev  # Start at localhost:3000
```

### 🔌 API Server (`apps/api`)
Express.js backend providing:
- RESTful API endpoints
- JWT authentication
- Real-time WebSocket connections
- Database integration

```bash
cd apps/api
pnpm dev  # Start at localhost:3001
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

### 🕷️ Data Scraper (`apps/scraper`)
Automated data ingestion service:

```bash
# Run scraper service
pnpm --filter @gauntlet/scraper dev

# Run specific scrapers
pnpm --filter @gauntlet/scraper scrape:players
pnpm --filter @gauntlet/scraper scrape:stats
pnpm --filter @gauntlet/scraper scrape:schedule
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

### 🎨 UI (`packages/ui`)
Shared React components:
- Design system components
- Fantasy-specific widgets
- Charts and visualizations
- Form components

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo**: pnpm workspaces + Turbo
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (frontend), Railway (backend)

## Environment Variables

### Web App (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### API Server (`apps/api/.env`)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/gauntlet
JWT_SECRET=your-secret-key
```

### Scraper Service (`apps/scraper/.env`)
```bash
ESPN_API_KEY=your-espn-key
YAHOO_CLIENT_ID=your-yahoo-id
YAHOO_CLIENT_SECRET=your-yahoo-secret
WEATHER_API_KEY=your-weather-key
```

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

# Start production servers
pnpm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Vercel Deployment (Frontend)
The web app is configured for automatic deployment to Vercel:

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod
```

## API Documentation

Once the API server is running, documentation is available at:
- **Development**: http://localhost:3001/docs
- **Swagger UI**: Interactive API documentation
- **OpenAPI Spec**: Machine-readable API specification

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join project discussions for questions and ideas

---

Built with ❤️ for fantasy football enthusiasts who demand the best tools for their high-stakes leagues. 