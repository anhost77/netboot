# BetTracker Pro - SaaS Horse Betting Tracking Application

![License](https://img.shields.io/badge/license-Private-red)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue)

## 📋 Overview

BetTracker Pro is a comprehensive SaaS application for tracking horse betting activities. Built with modern technologies and designed for self-hosting on Plesk servers, it provides users with powerful tools to manage their bets, analyze performance, and improve their betting strategies.

### Key Features

- 🔐 **Authentication System**: JWT-based auth with 2FA support
- 💳 **Subscription Management**: 4-tier pricing with Stripe integration
- 📊 **Bet Tracking**: Comprehensive tracking and analytics
- 💰 **Budget Management**: Bankroll tracking and spending limits
- 📈 **Statistics & Reports**: Advanced analytics and insights
- 🎫 **Support System**: Integrated ticketing system
- 📝 **CMS**: Built-in content management with WYSIWYG editor
- 🔒 **RGPD Compliant**: Full GDPR compliance features
- 📱 **PWA Ready**: Progressive Web App support
- 🌐 **Admin Panel**: Comprehensive admin dashboard

## 🏗️ Architecture

### Tech Stack

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (Database)
- Prisma ORM
- Redis (Caching & queues)
- Stripe (Payments)
- JWT (Authentication)

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query (TanStack Query)
- Zustand (State management)

**Infrastructure:**
- Plesk hosting
- PM2 (Process management)
- n8n (Workflow automation)
- Local file storage
- SMTP (Email)

### Subscription Plans

1. **Gratuit** (Free): 20 bets/month, 50 MB storage
2. **Starter**: €9.99/month - 100 bets/month, 500 MB storage
3. **Pro**: €19.99/month - Unlimited bets, 2 GB storage, API access
4. **Business**: €49.99/month - Unlimited bets, 10 GB storage, 5 users, priority support

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 6
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database:**
```bash
# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed initial data (plans, admin user, CMS pages)
npm run seed
```

5. **Start development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API Documentation (Swagger): `http://localhost:3000/api/docs`

### Default Admin Credentials

After seeding, you can login with:
- **Email:** admin@bettracker.pro
- **Password:** Admin123!

⚠️ **Important:** Change these credentials immediately in production!

### Frontend Setup

Coming soon... Frontend will be built with React + TypeScript + Tailwind CSS.

## 📁 Project Structure

```
.
├── backend/                    # NestJS Backend API
│   ├── prisma/                # Database schema & migrations
│   │   ├── schema.prisma      # Prisma schema definition
│   │   └── seed.ts            # Database seeding script
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── bets/              # Bet tracking
│   │   ├── subscriptions/     # Subscription management
│   │   ├── common/            # Shared utilities
│   │   └── main.ts            # Application entry point
│   ├── .env.example           # Environment variables template
│   └── package.json
├── frontend/                  # React Frontend (Coming soon)
├── storage/                   # Local file storage
│   ├── avatars/
│   ├── documents/
│   ├── invoices/
│   └── cms/
├── docs/                      # Documentation
└── scripts/                   # Utility scripts
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **plans**: Subscription plans
- **subscriptions**: User subscriptions
- **bets**: Bet records
- **invoices**: Payment invoices
- **support_tickets**: Support system
- **support_messages**: Ticket messages
- **documents**: File uploads
- **cms_pages**: CMS content
- **menu_items**: Dynamic menus
- **notifications**: User notifications
- **user_settings**: User preferences
- And more...

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/2fa/disable` - Disable 2FA

### More endpoints to be documented...

See full API documentation at `/api/docs` when running the server.

## 🛡️ Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Two-Factor Authentication (2FA) with TOTP
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation with class-validator
- ✅ HTTPS (Let's Encrypt on Plesk)

## 📊 Development Status

### ✅ Completed
- [x] Project structure
- [x] Database schema (Prisma)
- [x] Authentication system (JWT, 2FA)
- [x] Basic NestJS setup

### 🚧 In Progress
- [ ] Frontend React setup
- [ ] Subscription & Stripe integration
- [ ] Bet tracking module
- [ ] Statistics & analytics

### 📋 Planned
- [ ] Email system
- [ ] PDF invoice generation
- [ ] Support ticket system
- [ ] CMS with WYSIWYG
- [ ] Admin dashboard
- [ ] n8n workflows
- [ ] Deployment configs
- [ ] Full documentation

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Plesk Server Setup

1. **Install required software:**
   - Node.js (via Plesk Node.js extension)
   - PostgreSQL
   - Redis
   - PM2

2. **Configure domains:**
   - Frontend: `app.domain.com` or `domain.com`
   - Backend: `api.domain.com`

3. **Setup environment variables**

4. **Deploy backend:**
```bash
npm run build
pm2 start ecosystem.config.js
```

5. **Setup SSL certificates** (Let's Encrypt via Plesk)

6. **Configure Nginx reverse proxy**

Detailed deployment guide coming soon in `/docs/DEPLOYMENT.md`

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key
- `SMTP_*`: Email configuration

## 🤝 Contributing

This is a private project. Contributions are by invitation only.

## 📄 License

Private - All Rights Reserved

## ⚠️ Important Legal Notice

**JOUER COMPORTE DES RISQUES : ENDETTEMENT, ISOLEMENT, DÉPENDANCE**

**POUR ÊTRE AIDÉ, APPELEZ LE 09 74 75 13 13 (GRATUIT)**

This application is a tracking tool only. Users are responsible for the legality of their betting activities in their jurisdiction.

## 📧 Contact

For support or inquiries: contact@bettracker.pro

## 🎯 Roadmap

- **Phase 1** (Current): Foundation - Auth, Database, Basic API
- **Phase 2**: Core Features - Bets, Stats, Subscriptions
- **Phase 3**: Advanced Features - CMS, Support, Admin Panel
- **Phase 4**: Polish - Email, PDF, n8n Workflows
- **Phase 5**: Launch - Testing, Documentation, Deployment

## 📚 Additional Documentation

- [Installation Guide](docs/INSTALLATION.md) - Coming soon
- [API Documentation](docs/API.md) - Coming soon
- [Deployment Guide](docs/DEPLOYMENT.md) - Coming soon
- [User Guide](docs/USER_GUIDE.md) - Coming soon
- [Admin Guide](docs/ADMIN_GUIDE.md) - Coming soon

---

Built with ❤️ for horse betting enthusiasts
