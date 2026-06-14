# PRD Addendum — MaticCare: Pemisahan Frontend & Backend (API-based)

| | |
|---|---|
| **Versi** | 1.1 (addendum dari PRD v1.0) |
| **Tanggal** | 14 Juni 2026 |
| **Status** | Menggantikan §7 (Tech Stack) pada PRD v1.0 |

---

## 1. Alasan Perubahan

Pada v1.0, seluruh logika (data + forward chaining) berjalan di browser dari file JSON statis. Perubahan ini memisahkan menjadi:

- **Backend**: menyimpan rule base, menjadi *single source of truth* untuk algoritma diagnosa (forward chaining + scoring), diekspos via REST API.
- **Frontend**: thin client — render UI, kelola state per sesi, panggil API backend.

Manfaat: logika diagnosa terpusat & mudah diaudit/diupdate tanpa redeploy frontend, lebih mudah ditambah klien lain di masa depan (mobile app, dsb), dan selaras dengan praktik umum pengembangan web.

> Catatan: tetap **tidak perlu database** — data JSON (`gejala_master.json`, `rules.json`, `kategori_sistem.json`, `keluhan_utama.json`, `penyebab_saran.json`) cukup di-load ke memori oleh backend saat startup. DB sungguhan bisa jadi pertimbangan v2.0 jika ada kebutuhan menyimpan riwayat pengguna lintas device.

---

## 2. Tech Stack (Revisi)

| Layer | Pilihan | Catatan |
|---|---|---|
| **Backend** | Node.js + **Express** | Bahasa sama dengan frontend (JS), minim boilerplate, cukup untuk API kecil. |
| **Data layer** | File JSON di `backend/data/`, di-load ke memori saat server start | Tidak perlu DB untuk MVP. |
| **Frontend** | Tetap vanilla HTML/CSS/JS (ES Modules), tanpa framework besar | Sama seperti v1.0, hanya sumber data berubah dari file lokal → fetch API. |
| **Komunikasi** | REST API, JSON, format response konsisten (lihat §4) | |
| **Konfigurasi** | `.env` di masing-masing sisi (`PORT`, `CORS_ORIGIN` di backend; `VITE_API_BASE_URL`/`API_BASE_URL` di frontend) | Hindari hardcode URL. |
| **CORS** | Backend mengizinkan origin frontend (dev: `http://localhost:5173` atau sejenis; prod: domain frontend) | |
| **Hosting** | Backend & frontend di-deploy terpisah (mis. backend di Render/Railway/Fly.io, frontend di Netlify/Vercel/GitHub Pages) | Bisa juga sama-sama statis+serverless jika mau, tapi minimal harus *bisa* dipisah. |

---

## 3. Struktur Folder (Revisi)

```
maticcare/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.js                  // entry point, setup express + cors + routes
│   │   ├── routes/
│   │   │   ├── kategori.routes.js     // GET /api/v1/kategori, GET /api/v1/kategori/:id/keluhan
│   │   │   ├── keluhan.routes.js      // GET /api/v1/keluhan/:id/gejala
│   │   │   ├── gejala.routes.js       // GET /api/v1/gejala (opsional, untuk search)
│   │   │   └── diagnose.routes.js     // POST /api/v1/diagnose
│   │   ├── services/
│   │   │   ├── data.service.js        // load & cache semua JSON saat startup
│   │   │   └── diagnose.service.js    // forward chaining + scoring (pindahan dari lib/diagnose.js v1.0)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validateRequest.js
│   │   └── data/
│   │       ├── gejala_master.json
│   │       ├── rules.json
│   │       ├── kategori_sistem.json
│   │       ├── keluhan_utama.json
│   │       └── penyebab_saran.json
│   └── README.md
│
├── frontend/
│   ├── index.html
│   ├── package.json (opsional, jika pakai Vite)
│   ├── .env.example
│   ├── src/
│   │   ├── main.js
│   │   ├── router.js
│   │   ├── api/
│   │   │   └── client.js              // fetch wrapper, base URL dari env, error handling
│   │   ├── views/
│   │   │   ├── beranda.js
│   │   │   ├── pilih-sistem.js
│   │   │   ├── pilih-keluhan.js
│   │   │   ├── pilih-gejala.js
│   │   │   └── hasil-diagnosa.js
│   │   ├── lib/
│   │   │   └── state.js
│   │   └── styles/
│   │       └── main.css
│   └── README.md
│
├── PRD.md
├── PRD_ADDENDUM_API.md
└── README.md                          // overview cara jalankan dua service sekaligus
```

---

## 4. Spesifikasi API

Base path: `/api/v1`. Semua response berformat JSON dengan struktur konsisten:

```json
// sukses
{ "success": true, "data": <payload> }

// gagal
{ "success": false, "error": { "code": "STRING_CODE", "message": "Pesan ramah pengguna" } }
```

HTTP status code: `200` (sukses), `400` (request tidak valid, mis. `gejala_codes` kosong), `404` (id tidak ditemukan), `500` (error server).

### 4.1 `GET /api/v1/kategori`
Mengembalikan 9 kategori sistem (dari `kategori_sistem.json`), untuk halaman "Pilih Sistem/Komponen".

```json
{ "success": true, "data": [ { "id": "cvt", "nama": "CVT & Transmisi Otomatis", "deskripsi": "...", "icon": "circle-gauge", "jumlah_rule": 74 }, ... ] }
```

### 4.2 `GET /api/v1/kategori/:kategoriId/keluhan`
Mengembalikan daftar Keluhan Utama untuk kategori tersebut (dari `keluhan_utama.json`), untuk halaman "Pilih Keluhan Utama". Termasuk opsi "lainnya" (di-generate backend, bukan disimpan di JSON, agar konsisten).

```json
{ "success": true, "data": [
  { "id": "cvt-tarikan-berat", "label_awam": "Motor terasa berat / tarikan kurang responsif" },
  { "id": "cvt-lainnya", "label_awam": "Gejala saya tidak ada di daftar ini / lainnya", "is_fallback": true }
] }
```
404 jika `kategoriId` tidak dikenali.

### 4.3 `GET /api/v1/keluhan/:keluhanId/gejala`
Mengembalikan checklist gejala untuk Keluhan Utama terpilih (logika union + sorting frekuensi dari PRD v1.0 §5.4, dipindah ke backend). Untuk opsi "lainnya" (`*-lainnya`), kembalikan seluruh gejala unik di kategori terkait.

```json
{ "success": true, "data": {
  "kategori_id": "cvt",
  "gejala": [
    { "code": "G612", "nama": "Tarikan berat", "pre_checked": true },
    { "code": "G422", "nama": "RPM naik tapi laju lambat", "pre_checked": false }
  ]
} }
```

### 4.4 `POST /api/v1/diagnose`
Request body:
```json
{ "kategori_id": "cvt", "gejala_codes": ["G612", "G422", "G040", "G076", "G011", "G154", "G032"] }
```

Validasi: `kategori_id` wajib & valid, `gejala_codes` wajib array non-kosong berisi kode valid → jika tidak, response `400` dengan `code: "INVALID_REQUEST"`.

Response (status `ok`):
```json
{ "success": true, "data": {
  "status": "ok",
  "top": {
    "id": "K01",
    "kerusakan": "CVT slip",
    "percentage": 100,
    "label": "Sangat Mungkin",
    "matched": 7,
    "total_gejala": 7,
    "gejala_cocok": ["Tarikan berat", "RPM naik tapi laju lambat", "..."],
    "gejala_tidak_cocok": [],
    "penyebab": ["...", "..."],
    "saran": [ { "teks": "...", "level": "bisa_dipantau" } ]
  },
  "alternatif": [ { "id": "K48", "kerusakan": "Belt dust build-up", "percentage": 42.8, "label": "Mungkin", "matched": 3, "total_gejala": 7 } ]
} }
```

Response saat tidak ada rule lolos filter ≥30%:
```json
{ "success": true, "data": { "status": "no_match", "top": null, "alternatif": [] } }
```

Logika forward chaining & scoring **identik dengan PRD v1.0 §5.5** — hanya berpindah lokasi eksekusi dari browser ke `diagnose.service.js` di backend.

### 4.5 `GET /api/v1/gejala` (opsional, v1.1)
Mengembalikan seluruh `gejala_master.json` — untuk fitur pencarian gejala di masa depan. Tidak wajib untuk MVP refactor ini.

---

## 5. Penanganan Error & Edge Case

- Backend mengembalikan pesan error dalam Bahasa Indonesia yang ramah (`error.message`), karena frontend menampilkannya langsung jika perlu.
- Frontend (`api/client.js`) menangani: network error (tampilkan "Tidak dapat terhubung ke server, coba lagi"), response `4xx/5xx` (tampilkan `error.message` dari backend), timeout.
- CORS: pastikan preflight `OPTIONS` ditangani dengan benar oleh middleware `cors` Express.

---

## 6. Acceptance Criteria Tambahan

1. Frontend **tidak lagi membaca file JSON secara langsung** — seluruh data didapat via fetch ke backend.
2. Backend dapat dijalankan independen (`npm run dev` di `backend/`) dan diuji langsung via curl/Postman tanpa frontend.
3. Frontend dapat dijalankan independen, dikonfigurasi via env variable untuk menunjuk ke backend manapun (local/staging).
4. Seluruh endpoint di §4 mengembalikan format response konsisten (`success`, `data`/`error`).
5. Acceptance criteria PRD v1.0 §11 tetap berlaku — hasil akhir di UI harus sama persis (forward chaining tetap identik), hanya jalur datanya yang berubah.
6. Minimal terdapat test sederhana untuk `diagnose.service.js` (pindahan dari unit test v1.0) yang dijalankan di backend.