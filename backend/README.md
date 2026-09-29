# Youth Computing Portfolio - Backend API

## Description
API RESTful pour la plateforme portfolio de l'association Youth Computing.

## Technologies
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- Redis (Cache)
- Socket.IO (Real-time)
- JWT Authentication

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- Redis (optionnel)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values

# Run database migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start development server
npm run dev