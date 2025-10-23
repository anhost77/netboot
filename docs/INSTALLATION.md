# Installation Guide - BetTracker Pro

## Prerequisites

Before installing BetTracker Pro, ensure you have:

- Node.js >= 18.0.0 (LTS recommended)
- PostgreSQL >= 15
- Redis >= 6
- npm or yarn package manager
- Git

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd netboot
```

### 2. Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/bettracker_dev

# Redis - Update if needed
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT - Generate strong random secrets
JWT_SECRET=your-super-secret-jwt-key-at-least-64-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-64-chars-long
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe (Get from https://stripe.com/docs/keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...

# SMTP (Configure your email server)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password

# Storage
STORAGE_PATH=/var/www/vhosts/yourdomain.com/storage

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

#### 2.3 Setup Database

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE bettracker_dev;
CREATE USER bettracker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bettracker_dev TO bettracker_user;
\q
```

Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### 2.4 Seed Initial Data

Seed the database with initial plans, admin user, and CMS pages:

```bash
npm run seed
```

This creates:
- 4 subscription plans (Gratuit, Starter, Pro, Business)
- Admin user: admin@bettracker.pro / Admin123!
- CMS pages (CGU, CGV, Privacy, About)
- Menu items (Header & Footer)

⚠️ **Important:** Change the admin password after first login!

#### 2.5 Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

### 3. Frontend Setup

Coming soon... Frontend is not yet implemented.

### 4. Redis Setup

#### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

#### On macOS:

```bash
brew install redis
brew services start redis

# Test Redis
redis-cli ping
```

### 5. Testing the Installation

#### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T...",
  "uptime": 123.456,
  "environment": "development"
}
```

#### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bettracker.pro",
    "password": "Admin123!"
  }'
```

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify connection string in `.env`
3. Check PostgreSQL logs:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-15-main.log
   ```

### Redis Connection Issues

If Redis is not connecting:

1. Check Redis is running:
   ```bash
   sudo systemctl status redis-server
   ```

2. Test connection:
   ```bash
   redis-cli ping
   ```

### Port Already in Use

If port 3000 is already in use:

1. Find the process:
   ```bash
   lsof -i :3000
   ```

2. Kill the process or change the PORT in `.env`

### Prisma Issues

If you have Prisma errors:

1. Regenerate Prisma client:
   ```bash
   npm run prisma:generate
   ```

2. Reset database (⚠️ This deletes all data):
   ```bash
   npm run prisma:migrate reset
   ```

## Next Steps

- Configure Stripe for payments
- Setup email server (SMTP)
- Configure domains for production deployment
- Setup SSL certificates
- Install n8n for workflow automation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.
