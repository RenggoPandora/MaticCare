# MaticCare Frontend

Thin client untuk MaticCare — Sistem Pakar Diagnosa Kerusakan Motor Matic.

## Tech Stack
- HTML, CSS, Vanilla JS
- Vite (Dev Tool & Bundler)

## Cara Install & Jalankan

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sesuaikan konfigurasi API di `.env` (copy dari `.env.example`).
   - Default: `VITE_API_BASE_URL=http://localhost:3000/api/v1`
4. Jalankan dalam mode development:
   ```bash
   npm run dev
   ```
5. Build untuk production:
   ```bash
   npm run build
   ```

## Catatan
- Pastikan backend sudah berjalan sebelum menjalankan frontend agar data dapat dimuat.
- Tidak ada data JSON lokal di sini; semua data diambil dari backend.
