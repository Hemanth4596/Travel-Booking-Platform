# Travel Booking Platform

A full-stack travel booking platform built with React, Node.js, Express, and MongoDB.

## Features
- User Authentication (JWT)
- Search for Flights, Hotels, and Cabs
- Mock Checkout / Simulated Payment
- User Dashboard to manage bookings
- Booking cancellation

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
An admin account is created during seeding:
- Email: admin@travelbooking.com
- Password: admin123
