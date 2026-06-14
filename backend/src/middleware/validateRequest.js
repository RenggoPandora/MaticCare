import dataService from '../services/data.service.js';

export const validateDiagnoseRequest = (req, res, next) => {
  const { kategori_id, gejala_codes } = req.body;

  if (!kategori_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Kategori ID wajib diisi' }
    });
  }

  const kategoriSistem = dataService.getKategoriSistem();
  if (!kategoriSistem.find(k => k.id === kategori_id)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Kategori ID tidak valid' }
    });
  }

  if (!gejala_codes || !Array.isArray(gejala_codes) || gejala_codes.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Minimal pilih satu gejala' }
    });
  }

  const gejalaMaster = dataService.getGejalaMaster();
  const invalidCodes = gejala_codes.filter(code => !gejalaMaster[code]);
  
  if (invalidCodes.length > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: `Kode gejala tidak valid: ${invalidCodes.join(', ')}` }
    });
  }

  next();
};
