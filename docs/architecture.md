# The Gauntlet - System Architecture

## Overview

The Gauntlet is a high-stakes fantasy football platform built as a TypeScript-first monorepo using modern tools and practices. The system supports advanced simulation, dynamic scoring, and tightly integrated game mechanics.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query + Zustand
- **Type Safety**: TypeScript with strict configuration

### Backend
- **API**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket connections for live updates

### Infrastructure
- **Monorepo**: pnpm workspaces + Turbo
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Database**: Supabase or PlanetScale
- **Monitoring**: Sentry + PostHog analytics

## Architecture Patterns

### Domain-Driven Design
The system is organized around core fantasy football domains:
- **League Management**: Team creation, roster management, standings
- **Player Systems**: Stats tracking, projections, injury reports  
- **Simulation Engine**: Matchup predictions, scenario modeling
- **Data Pipeline**: Real-time stats ingestion and processing

### Event-Driven Architecture
Key events flow through the system:
```
NFL Game Update → Data Scraper → Player Stats → Simulation Engine → UI Updates
```

### CQRS Pattern
Separate read and write models for performance:
- **Commands**: League creation, roster changes, trades
- **Queries**: Standings, player stats, projections, analytics

## System Components

### Apps Layer
```
/apps/
├── web/          # Next.js frontend application
├── api/          # Express.js backend API
├── sim-engine/   # Fantasy simulation CLI/service
├── scraper/      # Data ingestion service
└── admin/        # Admin dashboard (optional)
```

### Packages Layer
```
/packages/
├── types/        # Shared TypeScript interfaces
├── lib/          # Utility functions and helpers
├── models/       # Business logic and domain models
└── ui/           # Shared React components
```

### Data Flow

#### 1. Data Ingestion
```
ESPN/Yahoo APIs → Scraper Service → Database → Cache Layer
```

#### 2. User Interactions  
```
Frontend → API Gateway → Business Logic → Database → Response
```

#### 3. Real-time Updates
```
Data Change → Event Bus → WebSocket → Frontend Updates
```

## Scalability Considerations

### Horizontal Scaling
- **API**: Stateless Express servers behind load balancer
- **Database**: Read replicas for queries, write master for commands
- **Cache**: Redis cluster for session and data caching

### Performance Optimization
- **CDN**: Static assets served from global edge locations
- **Database Indexing**: Optimized queries for common access patterns
- **Background Jobs**: Async processing for heavy computations

### Monitoring & Observability
- **APM**: Application performance monitoring with Sentry
- **Logging**: Structured logs with correlation IDs
- **Metrics**: Custom dashboards for business KPIs
- **Alerts**: Real-time notifications for system issues

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with refresh tokens
- **Role-Based Access**: League owners, members, admins
- **API Security**: Rate limiting, input validation, CORS

### Data Protection
- **Encryption**: Sensitive data encrypted at rest and in transit
- **PII Handling**: Minimal collection, secure storage, GDPR compliance
- **Audit Logs**: Track all user actions for compliance

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Run tests
pnpm test

# Build for production  
pnpm build
```

### CI/CD Pipeline
```
Code Push → GitHub Actions → Tests → Build → Deploy → Monitor
```

### Code Quality
- **Linting**: ESLint + Prettier for consistent formatting
- **Type Safety**: Strict TypeScript configuration
- **Testing**: Jest + React Testing Library + Playwright
- **Pre-commit**: Husky hooks for quality gates

## Future Considerations

### Microservices Migration
As the system grows, consider breaking apart into:
- **User Service**: Authentication and profiles
- **League Service**: League and team management  
- **Stats Service**: Player data and projections
- **Simulation Service**: Advanced modeling and predictions

### Advanced Features
- **Machine Learning**: AI-powered player projections
- **Real-time Chat**: Live league discussions
- **Mobile Apps**: Native iOS/Android applications
- **Advanced Analytics**: Deep statistical insights

## Deployment Architecture

### Production Environment
```
Internet → CDN → Load Balancer → App Servers → Database Cluster
                                      ↓
                               Background Workers
```

### Staging Environment
- **Mirror Production**: Same architecture at smaller scale
- **Feature Testing**: Safe environment for new functionality
- **Performance Testing**: Load testing before production releases 