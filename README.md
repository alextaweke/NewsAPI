# Afrolink News API with MySQL

A production-ready RESTful API for a news platform with author content management, reader engagement tracking, and a robust analytics engine using **MySQL** database.

## Features

- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 👥 **Role-Based Access Control** - Separate endpoints for authors and readers
- 📝 **Content Management** - Full CRUD operations with soft deletion
- 📊 **Analytics Engine** - Bull queue-based daily read aggregation
- 🛡️ **Rate Limiting** - Prevents spam and DOS attacks (5 reads per 10 seconds)
- 🎯 **Validation** - Centralized Joi schema validation
- 🚀 **Async Processing** - Non-blocking read tracking
- 📈 **Performance Dashboard** - Author analytics with view counts
- 🗄️ **MySQL Database** - Reliable, ACID-compliant storage with Sequelize ORM

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize (with mysql2 driver)
- **Cache/Queue**: Redis + Bull
- **Auth**: JWT + bcrypt
- **Validation**: Joi

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (recommended) OR
- MySQL 8.0+ installed locally
- Redis 7+ installed locally

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd afrolink-news-api
npm install
