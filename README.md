# Travel Booking Platform

A full-stack travel booking platform built with React, Node.js, Express, and MongoDB.

## Features
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing, HTTP-only cookie support, rate limiting, and strict input validation.
- **Search & Discovery**: Search flights, hotels, and cabs with ReDoS-safe query filtering.
- **Live Flight Radar**: 3D telemetry visualization with AviationStack integration, intelligent caching, and quota protection.
- **Simulated Payment Engine**: Deterministic demo payments, full transparency disclosures, and server-authoritative price validation.
- **User Dashboard & Bookings**: Secure booking management, cancellation, and notification center.

## Prerequisites
- Node.js (v18+)
- MongoDB Community Server (running locally on port 27017)

## Installation

1. Install dependencies for root, server, and client:
```powershell
npm run install:all
```

2. Environment Variables:
Inside `server/`, copy `.env.example` to `.env`:
```powershell
Copy-Item server/.env.example server/.env
```
Inside `client/`, copy `.env.example` to `.env`:
```powershell
Copy-Item client/.env.example client/.env
```

3. Seed the Database:
Ensure MongoDB is running locally. Then run:
```powershell
npm run seed
```

4. Start the Application:
```powershell
npm run dev
```

## Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Backend Health Check: http://localhost:5000/api/health

## Demo Accounts
The following demo accounts are created during database seeding and can also be auto-filled with one click on the login page:
1. **Demo User 1 (Standard User)**:
   - Email: `user1@travelbooking.com`
   - Password: `User1@123`
2. **Demo User 2 (Standard User)**:
   - Email: `user2@travelbooking.com`
   - Password: `User2@123`
3. **Demo Admin**:
   - Email: `admin@travelbooking.com`
   - Password: `admin123`

## Security & Hardening Overview
- **ReDoS Protection**: Search queries on flights and hotels use regular expression escaping to prevent ReDoS attacks.
- **Price Tampering Prevention**: The server computes authoritative base fares, taxes, and total amounts directly from the database inventory instead of trusting client-supplied prices.
- **Strict Input Validation**: Zod schemas validate registration and login inputs (type safety, email format, minimum password length).
- **Rate Limiting**: Brute-force and DoS protection on authentication and live telemetry endpoints.
- **CastError / NoSQL Injection Shielding**: All MongoDB ObjectId parameters are strictly validated prior to querying.
- **Credential & Secret Protection**: Hardcoded API keys removed from environment examples; passwords salted with bcrypt (10 rounds); sensitive headers scrubbed.
