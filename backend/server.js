// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ Create HTTP server from express app
const http = require('http').createServer(app);

// ✅ Create socket.io instance
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: '*', // ⚠️ Change this to your frontend domain in production
    methods: ['GET', 'POST'],
  },
});

// ✅ Attach socket handler AFTER creating io
require('./socket')(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB Connected');
    http.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
