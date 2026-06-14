# MaticCare Backend API

REST API untuk sistem pakar diagnosa kerusakan motor matic.

## Tech Stack
- Node.js
- Express
- CORS
- Dotenv

## Cara Install & Jalankan

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sesuaikan konfigurasi di `.env` (copy dari `.env.example`).
4. Jalankan dalam mode development:
   ```bash
   npm run dev
   ```
5. Jalankan dalam mode production:
   ```bash
   npm start
   ```

## Daftar Endpoint

### 1. Kategori Sistem
- **GET** `/api/v1/kategori`
  - Mengambil daftar kategori sistem/komponen.
- **GET** `/api/v1/kategori/:id/keluhan`
  - Mengambil daftar keluhan utama untuk kategori tertentu.

### 2. Keluhan & Gejala
- **GET** `/api/v1/keluhan/:id/gejala`
  - Mengambil daftar gejala untuk keluhan tertentu (termasuk filter & sorting).

### 3. Diagnosa
- **POST** `/api/v1/diagnose`
  - Melakukan diagnosa berdasarkan gejala yang dipilih.
  - Body: `{ "kategori_id": "string", "gejala_codes": ["string"] }`

## Contoh Request (Curl)

**Get Kategori:**
```bash
curl http://localhost:3000/api/v1/kategori
```

**Diagnosa:**
```bash
curl -X POST http://localhost:3000/api/v1/diagnose \
     -H "Content-Type: application/json" \
     -d '{"kategori_id": "cvt", "gejala_codes": ["G612", "G422"]}'
```
