import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { cookieParser } from './middleware/cookieParser';
import authRoutes from './routes/auth.routes';
import flightRoutes from './routes/flight.routes';
import hotelRoutes from './routes/hotel.routes';
import cabRoutes from './routes/cab.routes';
import bookingRoutes from './routes/booking.routes';
import itineraryRoutes from './routes/itinerary.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import paymentRoutes from './routes/payments.routes';

dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(cookieParser);

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// Restrict JSON payload size to 1MB to prevent memory exhaustion DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Travel Booking API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/cabs', cabRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler (sanitizes internal errors in production)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error caught by global handler]:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = (isProd && status === 500) ? 'An unexpected server error occurred' : (err.message || 'Internal Server Error');
  res.status(status).json({ error: message });
});

export default app;
