import express from 'express';
import dataService from '../services/data.service.js';

const router = express.Router();

// GET /api/v1/kategori
router.get('/', (req, res) => {
  const kategori = dataService.getKategoriSistem();
  res.json({ success: true, data: kategori });
});

// GET /api/v1/kategori/:id/keluhan
router.get('/:id/keluhan', (req, res) => {
  const { id } = req.params;
  const allKeluhan = dataService.getKeluhanUtama();
  
  const kategoriKeluhan = allKeluhan.filter(k => k.kategori_id === id);
  
  if (kategoriKeluhan.length === 0) {
    const kategoriSistem = dataService.getKategoriSistem();
    if (!kategoriSistem.find(k => k.id === id)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kategori tidak ditemukan' }
      });
    }
  }

  // Add fallback option
  const result = [
    ...kategoriKeluhan.map(k => ({ id: k.id, label_awam: k.label_awam })),
    { id: `${id}-lainnya`, label_awam: 'Gejala saya tidak ada di daftar ini / lainnya', is_fallback: true }
  ];

  res.json({ success: true, data: result });
});

export default router;
