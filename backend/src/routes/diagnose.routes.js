import express from 'express';
import diagnoseService from '../services/diagnose.service.js';
import { validateDiagnoseRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// POST /api/v1/diagnose
router.post('/', validateDiagnoseRequest, (req, res) => {
  const { kategori_id, gejala_codes } = req.body;
  
  const results = diagnoseService.getResults(kategori_id, gejala_codes);

  if (!results.top) {
    return res.json({
      success: true,
      data: {
        status: 'no_match',
        top: null,
        alternatif: []
      }
    });
  }

  res.json({
    success: true,
    data: {
      status: 'ok',
      top: results.top,
      alternatif: results.alternatif
    }
  });
});

export default router;
