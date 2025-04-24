# 🔐 Better Auth Starter Template

This template provides a simple, ready-to-use authentication server as a starting point for your app. Build your own reliable auth server while maintaining full ownership of your data without proprietary restrictions.

## ✨ Features
- 📧 Email and password login and registration
- 🩺 Healthcheck endpoint
- 📚 OpenAPI plugin enabled
- 💾 Session storage in Redis
- ⚡ Built with Hono.js for lightning-fast performance
- 📦 Compiles to a single Bun binary for easy deployment

## 🔧 Setup

Required environment variables:
- `REDIS_URL` - Connection string for Redis
- `DATABASE_URL` - Connection string for your database
- `BETTER_AUTH_SECRET` - Secret key for encryption and security

## 📊 Database Initialization

The database structure is initialized with the following tables:

- `user` - Stores user account information
- `account` - Manages provider-specific account data and authentication details
- `verification` - Handles email verification and other verification processes

Use the provided SQL migration script to set up your database:

```sql
create table "user" (
  "id" text not null primary key, 
  "name" text not null, 
  "email" text not null unique, 
  "email_verified" boolean not null, 
  "image" text, 
  "created_at" timestamp not null, 
  "updated_at" timestamp not null
);

create table "account" (
  "id" text not null primary key, 
  "account_id" text not null, 
  "provider_id" text not null, 
  "user_id" text not null, 
  "access_token" text, 
  "refresh_token" text, 
  "id_token" text, 
  "access_token_expires_at" timestamp, 
  "refresh_token_expires_at" timestamp, 
  "scope" text, 
  "password" text, 
  "created_at" timestamp not null, 
  "updated_at" timestamp not null
);

create table "verification" (
  "id" text not null primary key, 
  "identifier" text not null, 
  "value" text not null, 
  "expires_at" timestamp not null, 
  "created_at" timestamp, 
  "updated_at" timestamp
);
```

## 💡 Considerations
- 🔄 I strongly encourage **FORKING THIS REPO** and modifying the config to suit your needs, add other providers, email sending, etc.
- 🗄️ You can use the same DB for your app and this auth server, just be careful with the migrations. This enables you to directly interact with the users and auth tables from your main application.
- 🔌 You can use the endpoints directly or use better-auth on the client side and [set the base URL in the config file (highly recommended)](https://www.better-auth.com/docs/installation#create-client-instance).
- 📚 For complete documentation, visit [Better Auth Docs](https://www.better-auth.com).

## 🚀 Getting Started

### Railway Template (recommended)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/VOQsdL?referralCode=4ArgSI)

(If you aren't hosting on Railway or aren't using the Railpack builder you can safely delete the `railpack.json` file)

### Self host
1. Clone or fork this repository
2. Set up the required environment variables
3. Install the dependencies with `bun install`
4. Run the server with `bun run dev` (development) or `bun run build` (production)
5. Connect your application

### Main Endpoints
- `GET /health` - Check the health of the server
- `GET /api/auth/reference` - Scalar docs for all of the OpenAPI endpoints
- `GET /api/auth/sign-out` - Logout a user
- `POST /api/auth/sign-up/email` - Register a new user
```
{
  "name": "",
  "email": "",
  "password": "",
  "callbackURL": ""
}
```
- `POST /api/auth/sign-in/email` - Login a user
```
{
  "email": "",
  "password": "",
  "callbackURL": "",
  "rememberMe": ""
}
```

## ✨ Soon
- Admin panel