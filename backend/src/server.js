import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kategoriRoutes from './routes/kategori.routes.js';
import keluhanRoutes from './routes/keluhan.routes.js';
import diagnoseRoutes from './routes/diagnose.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: CORS_ORIGIN
}));

app.use(express.json());

// Routes
app.use('/api/v1/kategori', kategoriRoutes);
app.use('/api/v1/keluhan', keluhanRoutes);
app.use('/api/v1/diagnose', diagnoseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS allowed for: ${CORS_ORIGIN}`);
});
