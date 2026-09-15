import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Reload server models - updated for recipient auto-resolution and robust messaging [v2]

import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

import authRoutes from './routes/authRoutes.js';
import expoRoutes from './routes/expoRoutes.js';
import boothRoutes from './routes/boothRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import messageRoutes from "./routes/messageRoutes.js";

import exhibitorRoutes from './routes/exhibitorRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

const app = express();

// Core Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// APIs Routes 
app.use('/api/auth', authRoutes);
app.use('/api/expos', expoRoutes);
app.use('/api/booths', boothRoutes);

app.use('/api', exhibitorRoutes);
app.use('/api', registrationRoutes);
app.use('/api', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/profile', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api', boothRoutes);
app.use('/api', sessionRoutes);
app.use('/api', analyticsRoutes);


// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'EventSphere API is operational' });
});

// HTTP Server & Socket.io Binding
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});