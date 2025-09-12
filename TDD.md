# Technical Design Document - Nighttangerine POS System

## 1. System Overview

### Purpose

A modern Point of Sale (POS) system designed for retail businesses to manage transactions, inventory, customers, and reporting.

### Technology Stack

- **Runtime**: Node.js 22
- **Package Manager**: pnpm
- **Database**: PostgreSQL
- **Authentication**: Auth0
- **Containerization**: Docker & Docker Compose
- **Base OS**: Ubuntu 24.04

## 2. Architecture

### High-Level Architecture

```graph
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/Next)  │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Auth0       │    │   Redis Cache   │
│   (Identity)    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘
```

### Component Architecture

- **API Layer**: RESTful API with Express.js
- **Business Logic**: Service layer with domain models
- **Data Layer**: PostgreSQL with migrations
- **Authentication**: Auth0 integration
- **Caching**: Redis for session and frequently accessed data

## 3. Database Design

### Core Entities

```sql
Users (Auth0 managed + local profile)
├── user_id (UUID, primary)
├── auth0_id (string, unique)
├── role (enum: admin, manager, cashier)
├── store_id (UUID, foreign key)
└── created_at, updated_at

Stores
├── store_id (UUID, primary)
├── name (string)
├── address (text)
├── phone (string)
└── created_at, updated_at

Products
├── product_id (UUID, primary)
├── sku (string, unique)
├── name (string)
├── price (decimal)
├── cost (decimal)
├── category_id (UUID, foreign key)
├── stock_quantity (integer)
└── created_at, updated_at

Categories
├── category_id (UUID, primary)
├── name (string)
├── parent_category_id (UUID, nullable)
└── created_at, updated_at

Transactions
├── transaction_id (UUID, primary)
├── store_id (UUID, foreign key)
├── user_id (UUID, foreign key)
├── customer_id (UUID, nullable, foreign key)
├── total_amount (decimal)
├── tax_amount (decimal)
├── payment_method (enum)
├── status (enum: completed, refunded, cancelled)
└── created_at, updated_at

Transaction_Items
├── item_id (UUID, primary)
├── transaction_id (UUID, foreign key)
├── product_id (UUID, foreign key)
├── quantity (integer)
├── unit_price (decimal)
├── total_price (decimal)
└── created_at

Customers
├── customer_id (UUID, primary)
├── name (string)
├── email (string, nullable)
├── phone (string, nullable)
├── loyalty_points (integer, default: 0)
└── created_at, updated_at
```

## 4. API Design

### Authentication Endpoints

```api
POST /auth/login          - Auth0 login
POST /auth/logout         - Auth0 logout
GET  /auth/profile        - Get user profile
PUT  /auth/profile        - Update user profile
```

### Product Management

```api
GET    /api/products           - List products (with pagination)
GET    /api/products/:id       - Get product details
POST   /api/products           - Create product
PUT    /api/products/:id       - Update product
DELETE /api/products/:id       - Delete product
GET    /api/categories         - List categories
POST   /api/categories         - Create category
```

### Transaction Management

```api
POST   /api/transactions       - Create transaction
GET    /api/transactions       - List transactions
GET    /api/transactions/:id   - Get transaction details
POST   /api/transactions/:id/refund - Process refund
```

### Customer Management

```api
GET    /api/customers          - List customers
POST   /api/customers          - Create customer
GET    /api/customers/:id      - Get customer details
PUT    /api/customers/:id      - Update customer
```

### Reporting

```api
GET    /api/reports/sales      - Sales reports
GET    /api/reports/inventory  - Inventory reports
GET    /api/reports/customers  - Customer reports
```

## 5. Security Considerations

### Authentication & Authorization

- Auth0 handles user authentication
- JWT tokens for API access
- Role-based access control (RBAC)
- Store-level data isolation

### Data Protection

- All sensitive data encrypted at rest
- HTTPS for all communications
- Input validation and sanitization
- SQL injection prevention with parameterized queries

### Audit Trail

- All transactions logged
- User activity tracking
- Data modification history

## 6. Performance Requirements

### Response Time

- API responses: < 200ms (95th percentile)
- Database queries: < 100ms (average)
- Transaction processing: < 500ms

### Scalability

- Support 100+ concurrent users per store
- Handle 10,000+ products per store
- Process 1,000+ transactions per day per store

### Availability

- 99.9% uptime target
- Database backups every 6 hours
- Application health monitoring

## 7. Development Environment

### Docker Services

- **app**: Node.js 22 application server
- **db**: PostgreSQL 15 database
- **redis**: Redis cache (optional)

### Development Workflow

1. Local development with Docker Compose
2. Hot reload for rapid development
3. Database migrations with version control
4. Test environment with seed data

## 8. Deployment Strategy

### Containerization

- Multi-stage Docker builds
- Separate containers for app and database
- Environment-specific configurations
- Health checks for all services

### Environment Variables

```env
NODE_ENV=development|production
DATABASE_URL=postgresql://...
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
REDIS_URL=redis://...
```

## 9. Testing Strategy

### Unit Tests

- Service layer business logic
- Database models and queries
- Utility functions

### Integration Tests

- API endpoint testing
- Database integration
- Auth0 integration

### End-to-End Tests

- Complete transaction flows
- User authentication flows
- Critical business processes

## 10. Future Enhancements

### Phase 2 Features

- Real-time inventory sync
- Mobile app support
- Advanced reporting and analytics
- Multi-location support
- Loyalty program management

### Technical Improvements

- GraphQL API option
- Microservices architecture
- Event-driven architecture
- Advanced caching strategies
- Performance monitoring and alerting
