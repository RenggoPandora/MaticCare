# MaticCare — Sistem Pakar Diagnosa Kerusakan Motor Matic

MaticCare adalah aplikasi sistem pakar berbasis web untuk mendiagnosa kerusakan pada sepeda motor matic menggunakan algoritma **Forward Chaining**.

Proyek ini telah direfactor menjadi arsitektur **Client-Server (Frontend/Backend)**.

## Struktur Proyek

- `/backend`: Node.js + Express API. Menyimpan basis aturan (rule base) dan menjalankan logika diagnosa.
- `/frontend`: Vanilla JS thin client. Menampilkan antarmuka pengguna dan mengambil data dari backend.

## Cara Menjalankan (Development)

Anda perlu menjalankan kedua layanan secara bersamaan.

### 1. Jalankan Backend
```bash
cd backend
npm install
npm run dev
```
Server akan berjalan di `http://localhost:3000`.

### 2. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173` (default Vite).

## Kontrak API
Dokumentasi endpoint tersedia di [backend/README.md](./backend/README.md).

## Algoritma Diagnosa
Aplikasi menggunakan metode matching score sederhana:
- Persentase kecocokan = (jumlah gejala cocok / total gejala pada pola kerusakan) * 100%.
- Minimal kecocokan 30% untuk ditampilkan.
- Diurutkan berdasarkan persentase tertinggi.

## Disclaimer
Hasil diagnosa bersifat indikasi awal. Harap periksa ke bengkel terdekat demi keselamatan berkendara.
