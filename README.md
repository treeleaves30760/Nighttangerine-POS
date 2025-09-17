# NightTangerine POS

A modern Point of Sale (POS) system built with React, Node.js, and PostgreSQL. Features real-time product management, authentication via Auth0, and a responsive design with a professional landing page and staff interface.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 8.0.0
- **Docker & Docker Compose** (for containerized development)

### 🐳 Docker Development (Recommended)

The fastest way to get started is using Docker, which works consistently across all operating systems:

```bash
# 1. Clone and enter the project directory
git clone https://github.com/treeleaves30760/nighttangerine-pos.git
cd nighttangerine-pos

# 2. Install dependencies
pnpm install:all

# 3. Set up and start everything with Docker
pnpm run docker:setup

# 4. Start development servers
pnpm run dev:all
```

This will:

- Start PostgreSQL database in Docker
- Run database migrations and seeds
- Start both backend API (port 3001) and frontend (port 3000)

### 🔧 Manual Setup (Without Docker)

If you prefer running services locally:

```bash
# 1. Install dependencies
pnpm install:all

# 2. Set up environment variables (copy from .env.example)
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 3. Start PostgreSQL locally and update .env with your database credentials

# 4. Set up database
pnpm run db:migrate
pnpm run db:seed

# 5. Start development servers
pnpm run dev:all
```

## 📱 Accessing the Application

After setup, access these URLs:

- **Landing Page**: <http://localhost:3000> (Marketing/landing page)
- **Staff POS System**: <http://localhost:3000/sells> (Login required)
- **Product Management**: <http://localhost:3000/settings> (Login required)
- **API Health Check**: <http://localhost:3001/health>

## 🛠 Available Commands

### Development

```bash
# Start both backend and frontend in development mode
pnpm run dev:all

# Start only backend API server
pnpm run dev

# Start only frontend development server
pnpm run dev:frontend

# Install all dependencies (root + frontend)
pnpm run install:all
```

### Database Management

```bash
# Run database migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:rollback

# Seed database with sample data
pnpm run db:seed

# Complete database setup (migrate + seed)
pnpm run setup:db
```

### Docker Operations

```bash
# Start all services with Docker
pnpm run docker:up

# View logs from Docker containers
pnpm run docker:logs

# Stop all Docker services
pnpm run docker:down

# Rebuild Docker containers
pnpm run docker:build

# Complete cleanup (remove everything)
pnpm run docker:clean

# One-command setup with Docker
pnpm run docker:setup
```

### Code Quality

```bash
# Run TypeScript type checking
pnpm run typecheck

# Run ESLint
pnpm run lint

# Fix ESLint issues automatically
pnpm run lint:fix

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage
```

### Production

```bash
# Build backend
pnpm run build

# Build frontend
pnpm run build:frontend

# Start production server (after build)
pnpm run start
```

## 🏗 Architecture

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database with Knex.js ORM
- **Auth0** for authentication
- **RESTful API** design

### Frontend

- **Next.js 14** with React 18
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Shadcn/ui** components for UI consistency
- **Auth0 Next.js SDK** for authentication
- **Responsive design** for mobile and desktop

### Database

- **PostgreSQL** with UUID primary keys
- **Knex.js** migrations and seeds
- **Products table** with categories and availability
- **Extensible schema** for future features

## 🔐 Authentication

The application uses **Auth0** for secure authentication:

1. Staff members log in via Auth0
2. Landing page is publicly accessible
3. POS system and settings require authentication
4. Environment variables configure Auth0 integration

## 🐳 Docker Support

The project includes comprehensive Docker support:

- **Multi-stage builds** for optimized images
- **Development and production** configurations
- **Cross-platform compatibility** (Linux, macOS, Windows)
- **Volume persistence** for database data
- **Environment-specific** docker-compose files

## 📁 Project Structure

```
Nighttangerine-POS/
├── src/                    # Backend source code
│   ├── config/            # Database and app configuration
│   ├── models/            # Database models
│   ├── routes/            # API route handlers
│   └── index.ts           # Server entry point
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # Reusable UI components
│   │   └── lib/          # Utilities and API client
│   └── package.json
├── database/              # Database migrations and seeds
│   ├── migrations/       # Knex.js migration files
│   └── seeds/            # Database seed files
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Container build instructions
└── package.json          # Project dependencies and scripts
```

## 🌟 Features

- **Professional Landing Page** - Marketing site with features, pricing, and FAQ
- **Real-time Product Management** - Add, edit, delete products instantly
- **Category Organization** - Beverages, Food, Bakery with custom icons
- **Availability Toggle** - Mark items as in/out of stock
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Staff Authentication** - Secure login for POS access
- **Modern UI Components** - Built with Shadcn/ui for consistency
- **TypeScript** - Full type safety across frontend and backend
- **Docker Support** - Consistent development across all platforms

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**

```bash
# Check what's using the ports
lsof -i :3000 -i :3001 -i :5432

# Kill processes if needed
pnpm run docker:down
```

**Database connection issues:**

```bash
# Reset Docker containers and try again
pnpm run docker:clean
pnpm run docker:setup

# If database setup fails, try running migrations manually
pnpm run docker:up
sleep 15
pnpm run setup:db
```

**Missing dependencies:**

```bash
# Reinstall everything
pnpm run install:all
```

**Peer dependency warnings:**

```bash
# Clear package lock and reinstall (if needed)
rm -rf node_modules frontend/node_modules
rm pnpm-lock.yaml
pnpm install:all
```

**Environment variables:**

- Ensure `.env` files are properly configured
- Check Auth0 credentials are correct
- Verify database connection strings

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a Pull Request

---

**Happy coding! 🚀**
