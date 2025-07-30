# The Gauntlet API

Backend API service for The Gauntlet fantasy football platform.

## Features

- User authentication and management
- Game state management
- League administration
- Real-time updates
- Statistics and analytics

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Environment Variables

Create a `.env` file with:

```
NODE_ENV=development
PORT=3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1/status` - Service status
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/leagues` - Get user leagues
- `POST /api/v1/leagues` - Create new league
