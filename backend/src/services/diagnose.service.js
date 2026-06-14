import dataService from './data.service.js';
import { diagnose } from './diagnose.js';

class DiagnoseService {
  getResults(kategoriId, selectedGejalaCodes) {
    const rules = dataService.getRules();
    const kategoriSistem = dataService.getKategoriSistem();
    const penyebabSaran = dataService.getPenyebabSaran();

    const kategori = kategoriSistem.find(k => k.id === kategoriId);
    if (!kategori) {
      throw new Error(`Kategori ${kategoriId} tidak ditemukan`);
    }

    // Filter rules by kategori (bagian_terkait)
    const rulesForCategory = rules.filter(rule => 
      kategori.bagian_terkait.some(b => b.toUpperCase() === rule.bagian.toUpperCase())
    );

    const results = diagnose(selectedGejalaCodes, rulesForCategory);

    // Enrich results with penyebab and saran
    if (results.top) {
      const ps = penyebabSaran[results.top.kerusakan] || { penyebab: [], saran: [] };
      results.top.penyebab = ps.penyebab;
      results.top.saran = ps.saran;
    }

    results.alternatif = results.alternatif.map(alt => {
      const ps = penyebabSaran[alt.kerusakan] || { penyebab: [], saran: [] };
      return {
        ...alt,
        penyebab: ps.penyebab,
        saran: ps.saran
      };
    });

    return results;
  }
}

export default new DiagnoseService();
