import express from 'express';
import dataService from '../services/data.service.js';

const router = express.Router();

// GET /api/v1/keluhan/:id/gejala
router.get('/:id/gejala', (req, res) => {
  const { id } = req.params;
  const allKeluhan = dataService.getKeluhanUtama();
  const rules = dataService.getRules();
  const gejalaMaster = dataService.getGejalaMaster();
  const kategoriSistem = dataService.getKategoriSistem();

  let keluhan = allKeluhan.find(k => k.id === id);
  let kategoriId = keluhan ? keluhan.kategori_id : null;
  let isFallback = false;

  if (!keluhan) {
    // Check if it's a fallback ID (e.g. cvt-lainnya)
    if (id.endsWith('-lainnya')) {
      kategoriId = id.replace('-lainnya', '');
      isFallback = true;
    } else {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Keluhan tidak ditemukan' }
      });
    }
  }

  const kategori = kategoriSistem.find(k => k.id === kategoriId);
  if (!kategori) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Kategori tidak ditemukan' }
    });
  }

  // Filter rules for this category
  const rulesForCategory = rules.filter(r => 
    kategori.bagian_terkait.some(b => b.toUpperCase() === r.bagian.toUpperCase())
  );

  let candidateRules = rulesForCategory;
  let anchorCodes = [];

  if (!isFallback) {
    anchorCodes = keluhan.gejala_anchor;
    candidateRules = rulesForCategory.filter(r => 
      r.gejala_codes.some(code => anchorCodes.includes(code))
    );
  }

  // Union all symptoms from candidate rules
  const symptomCodes = new Set();
  const symptomFrequency = {};

  candidateRules.forEach(r => {
    r.gejala_codes.forEach(code => {
      symptomCodes.add(code);
      symptomFrequency[code] = (symptomFrequency[code] || 0) + 1;
    });
  });

  // Convert to array and sort by frequency
  const resultGejala = Array.from(symptomCodes).map(code => ({
    code,
    nama: gejalaMaster[code] || code,
    pre_checked: anchorCodes.includes(code)
  }));

  resultGejala.sort((a, b) => symptomFrequency[b.code] - symptomFrequency[a.code]);

  res.json({
    success: true,
    data: {
      kategori_id: kategoriId,
      gejala: resultGejala
    }
  });
});

export default router;
