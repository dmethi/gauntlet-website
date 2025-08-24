# 🏈 The Gauntlet - Setup & Running Instructions

A high-stakes fantasy football platform with advanced analytics, Monte Carlo simulations, and real-time win probabilities.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher
- **PostgreSQL**: v14 or higher

### Installation & Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd gauntlet-website

# 2. Install all dependencies
pnpm install

# 3. Set up environment variables
echo "DATABASE_URL=postgresql://username:password@localhost:5432/gauntlet_db" > apps/server/.env
echo "DATABASE_URL=postgresql://username:password@localhost:5432/gauntlet_db" > apps/web/.env.local

# 4. Set up database schema and generate Prisma clients
cd apps/server
npx prisma migrate dev
npx prisma generate
cd ../web
npx prisma generate --schema=src/generated/prisma/schema.prisma
cd ../..

# 5. Start development servers
pnpm dev
```

**That's it!** The app will be running at http://localhost:3000

## 🏗️ Project Structure

This is a **monorepo** using pnpm workspaces:

```
gauntlet-website/
├── apps/
│   ├── web/          # Next.js frontend application and API routes
│   ├── server/       # Backend scripts and database operations
│   └── sim-engine/   # Monte Carlo simulation engine
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── lib/          # Utility functions
│   ├── ui/           # Shared UI components
│   └── models/       # Business logic models
└── brand/            # Brand assets and design tokens
```

## 📊 Key Features

- **2 Leagues**: 12 teams each with 3 divisions
- **6-Team Playoffs**: With promotion/relegation between leagues
- **Advanced Analytics**: Monte Carlo simulations for win probabilities
- **Real-time Data**: Live scoring updates during NFL games
- **Hall of Fame**: Comprehensive record tracking system

## 🎯 Development Commands

### Main Commands (run from root)
```bash
pnpm dev              # Start all development servers
pnpm build           # Build all packages and applications
pnpm lint            # Run linting across all packages
pnpm lint:fix        # Fix linting issues
pnpm type-check      # TypeScript type checking
pnpm clean           # Clean build artifacts
```

### Server Operations
```bash
# Data ingestion and processing
pnpm --filter @gauntlet/server ingest:all

# Run Monte Carlo simulations
pnpm --filter @gauntlet/server live-sims

# Database operations
pnpm --filter @gauntlet/server prisma:migrate
pnpm --filter @gauntlet/server inventory:db

# Analytics calculations
pnpm --filter @gauntlet/server metrics:calc
pnpm --filter @gauntlet/server rollups:compute
```

## 🗄️ Database Setup

This project uses a **dual Prisma setup**:

- **Primary Schema**: `apps/server/prisma/schema.prisma` (authoritative)
- **Web App Schema**: `apps/web/src/generated/prisma/schema.prisma` (copy)

Both schemas must stay in sync. The setup commands above handle this automatically.

### Environment Variables Required

Create these files with your database connection:

**`apps/server/.env`:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gauntlet_db
```

**`apps/web/.env.local`:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gauntlet_db
```

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **Monorepo**: pnpm workspaces + Turbo for build orchestration
- **Deployment**: Vercel (frontend + API routes)

## 📱 What You Get

After setup, you'll have access to:

### Web Interface (http://localhost:3000)
- **League Overview**: Team standings, power rankings, playoff odds
- **Live Matchups**: Real-time win probabilities during games
- **Team Analytics**: Individual team performance metrics
- **Hall of Fame**: Comprehensive record tracking
- **Playoff Bracket**: 6-team tournament with reseeding
- **Charts & Analytics**: Advanced statistical visualizations

### API Endpoints
- Real-time win probability calculations
- Team and player statistics
- League management operations
- Hall of Fame record queries

## 🚨 Troubleshooting

### Prisma Client Issues
```bash
# Regenerate both Prisma clients
cd apps/server && npx prisma generate
cd apps/web && npx prisma generate --schema=src/generated/prisma/schema.prisma
```

### Development Servers Won't Start
1. Ensure PostgreSQL is running locally
2. Verify DATABASE_URL in both `.env` files
3. Try `pnpm install` to reinstall dependencies
4. Check Node.js version (must be ≥18.0.0)

### Database Connection Issues
1. Create the database: `createdb gauntlet_db`
2. Run migrations: `cd apps/server && npx prisma migrate dev`
3. Verify connection string format

## 🚀 Production Deployment

The project is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard:
# DATABASE_URL=your-production-database-url
```

See `DEPLOYMENT_GUIDE.md` for detailed production setup.

## 🎮 Usage Tips

1. **First Time Setup**: Run data ingestion to populate initial data
2. **Development**: Use `pnpm dev` from root - it starts all necessary services
3. **Database Changes**: Always edit the primary schema in `apps/server/prisma/`
4. **Testing Simulations**: Use the playground page to test Monte Carlo simulations

## 📖 Additional Documentation

- `docs/architecture.md` - System architecture overview
- `docs/chart-color-guidelines.md` - UI design guidelines  
- `DEPLOYMENT_GUIDE.md` - Production deployment instructions
- `apps/web/src/app/todos/page.tsx` - Development roadmap and task tracking

## 🤝 Contributing

This project follows a structured development approach. Check the TODO management system at `/todos` for current priorities and task dependencies.

---

**Built for fantasy football enthusiasts who demand advanced analytics and real-time insights for their high-stakes leagues.**
