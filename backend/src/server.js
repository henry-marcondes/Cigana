require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Routes
const booksRoutes = require('./routes/books');
const chaptersRoutes = require('./routes/chapters');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS options
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));  // ✅ Correto: cors() é uma função
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API Ciganas rodando!' });
});

// Routes
app.use('/books', booksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/progress', progressRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
