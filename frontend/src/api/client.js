const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.error && data.error.message) || response.statusText;
    throw new Error(error);
  }
  return data.data;
}

export const apiClient = {
  async getKategori() {
    try {
      const response = await fetch(`${API_BASE_URL}/kategori`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Gagal mengambil data kategori. Pastikan server aktif.');
    }
  },

  async getKeluhan(kategoriId) {
    try {
      const response = await fetch(`${API_BASE_URL}/kategori/${kategoriId}/keluhan`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Gagal mengambil data keluhan.');
    }
  },

  async getGejala(keluhanId) {
    try {
      const response = await fetch(`${API_BASE_URL}/keluhan/${keluhanId}/gejala`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Gagal mengambil data gejala.');
    }
  },

  async postDiagnose(kategoriId, gejalaCodes) {
    try {
      const response = await fetch(`${API_BASE_URL}/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kategori_id: kategoriId,
          gejala_codes: gejalaCodes
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Gagal memproses diagnosa.');
    }
  }
};
