# PRD — MaticCare
### Sistem Pakar Diagnosa Kerusakan Motor Matic untuk Pengguna Awam

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 14 Juni 2026 |
| **Status** | Draft untuk implementasi MVP |
| **Pemilik Produk** | Renggo |

---

## 1. Latar Belakang & Tujuan

Pemilik motor matic awam sering kesulitan menerjemahkan gejala yang dirasakan ("motor bunyi kasar", "tarikan berat") menjadi informasi yang berguna sebelum ke bengkel. MaticCare adalah aplikasi web sistem pakar berbasis **rule base IF-THEN (forward chaining)** yang membantu pengguna:

1. Memilih sistem/komponen yang bermasalah.
2. Memilih gejala yang dialami dari daftar bahasa sehari-hari (bukan istilah teknis bengkel).
3. Mendapatkan diagnosa kemungkinan kerusakan, tingkat kecocokan, penyebab, dan saran penanganan awal.

**Tujuan utama:**
- Edukatif & informatif — membantu pengguna memahami kondisi motornya sebelum ke bengkel.
- Mudah digunakan oleh orang yang tidak punya latar belakang teknis otomotif.
- Sederhana untuk dibangun, dirawat, dan di-deploy (cocok untuk proyek mata kuliah / portofolio).

**Bukan tujuan (out of scope):**
- Bukan pengganti diagnosa mekanik profesional — hasil bersifat *indikasi*, bukan kepastian.
- Tidak menangani transaksi (booking bengkel, pembelian sparepart, dll) di MVP.
- Tidak memerlukan akun/login pengguna di MVP.

---

## 2. Sumber Data & Basis Pengetahuan

Sumber: `Rule_Base_Kode_Gejala.docx` (Sistem Pakar Diagnosa Penyakit Sepeda Motor).

| Komponen | Jumlah |
|---|---|
| Total rule (kerusakan) | 310 |
| Kerusakan unik (nama berbeda) | 290 |
| Total kode gejala unik | 697 (G001–G697) |
| Bagian/sistem mentah pada dokumen | 31 |
| Jumlah gejala per rule | 2–7 (mayoritas 3) |

Data sudah dikonversi ke JSON dan disertakan sebagai bagian dari paket ini (lihat Lampiran A):

- `data/gejala_master.json` — peta `{ "G001": "Air berkurang", ... }`, 697 entri.
- `data/rules.json` — array 310 rule: `{ id, bagian, kerusakan, gejala_codes[], gejala_names[] }`.
- `data/kategori_sistem.json` — 9 kategori "Sistem/Komponen" hasil konsolidasi dari 31 bagian mentah (lihat §5.2).

> ⚠️ **Gap data yang harus diisi sebelum rilis:** dataset asli **tidak** memiliki kolom "Penyebab" dan "Saran Penanganan" — hanya nama kerusakan. Lihat §6.5 untuk rencana pengisian konten ini (`data/penyebab_saran.json`).

---

## 3. Target Pengguna & Persona

- **Pengguna awam** pemilik motor matic (Honda BeAT, Vario, Yamaha NMAX, Mio, dll), usia 17–50 tahun, mayoritas mengakses lewat **HP** di lokasi (di rumah/pinggir jalan saat motor bermasalah).
- Tidak familiar dengan istilah teknis ("CVT", "kiprok", "TPS") — bahasa UI harus dijembatani dengan istilah awam + istilah teknis sebagai keterangan tambahan.
- Koneksi internet bisa terbatas → aplikasi harus **ringan**, idealnya bisa berjalan sebagai static site / dapat di-cache.

---

## 4. User Flow

```
Beranda
  │
  ▼
Mulai Diagnosa
  │
  ▼
Pilih Sistem/Komponen        (9 kategori, lihat §5.2)
  │
  ▼
Pilih Keluhan Utama           (3–6 keluhan umum per kategori, bahasa awam)
  │
  ▼
Pilih Gejala yang Dialami      (checklist multi-select, gejala relevan
  │                              terhadap keluhan utama yang dipilih)
  ▼
Proses Diagnosa (Forward Chaining + skor kecocokan)
  │
  ▼
Hasil Diagnosa
  ├── Kerusakan Paling Mungkin
  ├── Tingkat Kecocokan (%)
  ├── Gejala yang Cocok (vs tidak cocok)
  ├── Penyebab
  ├── Saran Penanganan
  └── Kemungkinan Lain (alternatif diagnosa, collapsible)
```

Tambahan flow pendukung:
- Dari **Hasil Diagnosa**, pengguna bisa: "Diagnosa Ulang" (reset), "Pilih Gejala Lain" (kembali ke step sebelumnya tanpa reset total), atau "Kembali ke Beranda".
- **Riwayat Diagnosa** (opsional, v1.1): menyimpan diagnosa terakhir di `localStorage` agar pengguna bisa membuka kembali tanpa mengisi ulang.

---

## 5. Spesifikasi Fitur

### 5.1 Beranda
- Penjelasan singkat apa itu MaticCare dan cara kerjanya (3 langkah sederhana).
- CTA besar **"Mulai Diagnosa"**.
- Disclaimer yang jelas dan tidak menakutkan: *"Hasil diagnosa bersifat indikasi awal berbasis gejala yang dipilih. Untuk kepastian dan keselamatan, periksakan motor ke bengkel/mekanik tepercaya."*
- (Opsional) Statistik singkat: "310 pola kerusakan • 9 kategori sistem" — untuk membangun kepercayaan, ditampilkan secara jujur tanpa membesar-besarkan.

### 5.2 Pilih Sistem/Komponen

31 "bagian" mentah pada dataset perlu dikonsolidasi menjadi kategori yang masuk akal bagi pengguna awam. Pemetaan berikut sudah disiapkan di `kategori_sistem.json`:

| Kategori (UI) | Bagian asli yang digabung | Jumlah rule |
|---|---|---|
| CVT & Transmisi Otomatis | CVT | 74 |
| Mesin & Pelumasan | MESIN, ENGINE, PELUMASAN | 61 |
| Kelistrikan & Lampu | KELISTRIKAN, ELECTRICAL, LAMPU, LAMPU UTAMA, LAMPU REM | 62 |
| Pengapian & Sensor | PENGAPIAN, SISTEM PENGAPIAN, SENSOR | 15 |
| Sistem Pendinginan | PENDINGINAN, SISTEM PENDINGINAN | 16 |
| Bahan Bakar & Injeksi | BAHAN BAKAR, SISTEM BAHAN BAKAR, FUEL SYSTEM, SISTEM INJEKSI, SYSTEM, SISTEM | 46 |
| Sistem Rem | REM, REM DEPAN, REM BELAKANG, REM ABS | 21 |
| Knalpot & Emisi | KNALPOT, EXHAUST | 5 |
| Bodi, Rangka & Kaki-kaki | BODI, RANGKA, SUSPENSI, BAN, KEMUDI | 10 |

Total = 310. UI menampilkan 9 kartu kategori dengan ikon dan deskripsi singkat (sudah tersedia di JSON).

### 5.3 Pilih Keluhan Utama

Tujuan langkah ini: mempersempit 697 gejala menjadi pilihan yang relevan & tidak membebani pengguna (tidak realistis menampilkan ratusan checkbox).

**Pendekatan (harus diimplementasikan oleh code agent sebagai data-prep script, hasil disimpan statis):**

1. Untuk setiap kategori sistem, ambil semua rule di dalamnya.
2. Hitung frekuensi setiap `gejala_codes` di antara rule-rule tersebut.
3. Ambil **gejala dengan frekuensi tertinggi** (top 4–8) sebagai kandidat "Keluhan Utama" — ini biasanya gejala yang paling sering jadi indikator utama (mis. untuk CVT: "Tarikan berat", "Getaran", "Bunyi kasar CVT", "Bau gosong").
4. Tulis ulang nama gejala teknis tersebut ke **bahasa awam** sebagai label "Keluhan Utama" (boleh manual / human-curated, disimpan di `data/keluhan_utama.json`). Contoh:
   - `G612 Tarikan berat` → "Motor terasa berat / tarikan kurang responsif"
   - `G306 Mesin brebet` → "Mesin tersendat-sendat / brebet"
   - `G135 Getaran` → "Motor bergetar tidak normal"
5. Setiap "Keluhan Utama" menyimpan referensi ke gejala "anchor" tersebut, yang akan digunakan untuk memfilter daftar gejala pada step berikutnya (lihat §5.4).

**Catatan implementasi:** Field ini bersifat **single-select** (radio button), karena tujuannya menyaring rule-set sebelum menampilkan checklist gejala detail. Sertakan opsi terakhir **"Gejala saya tidak ada di daftar ini / lainnya"** yang akan menampilkan checklist gejala dari *semua* rule pada kategori tersebut tanpa filter awal — agar pengguna tidak buntu.

### 5.4 Pilih Gejala yang Dialami (Multi-select)

- Setelah Keluhan Utama dipilih, tampilkan **checklist gejala** yang relevan:
  - Kumpulkan semua rule pada kategori tersebut yang mengandung gejala anchor dari Keluhan Utama yang dipilih.
  - Union semua `gejala_names` dari rule-rule tersebut → ini menjadi daftar checkbox (deduplikasi).
  - Urutkan berdasarkan frekuensi kemunculan (gejala yang sering muncul di banyak rule ditampilkan lebih dulu).
  - Batasi tampilan awal ke ±15–20 item, dengan tombol **"Tampilkan gejala lainnya"** untuk sisanya (mencegah halaman terlalu panjang/menakutkan).
- Gejala anchor dari Keluhan Utama **otomatis ter-centang** (pre-checked), pengguna bisa membatalkannya.
- Minimal **1 gejala** harus dipilih untuk melanjutkan ke proses diagnosa. Jika 0, tombol "Proses Diagnosa" disabled dengan helper text.
- UI menampilkan teks gejala dalam bahasa Indonesia natural (sesuai `gejala_master.json`), tanpa menampilkan kode `Gxxx` ke pengguna (kode hanya dipakai internal untuk matching).

### 5.5 Proses Diagnosa (Forward Chaining)

**Algoritma (Certainty/Matching Score sederhana):**

Untuk setiap rule `R` dalam rule base **pada kategori sistem yang dipilih** dengan himpunan gejala `S_R` (ukuran `n`) dan himpunan gejala yang dipilih pengguna `S_U`:

```
matched(R)     = |S_R ∩ S_U|                     // jumlah gejala yang cocok
percentage(R)  = matched(R) / |S_R| * 100        // tingkat kecocokan (%)
```

**Aturan filter & ranking:**
1. Buang semua rule dengan `matched(R) == 0`.
2. (Opsional, untuk mengurangi false positive) buang rule dengan `percentage(R) < 30%`.
3. Urutkan rule tersisa berdasarkan: `percentage(R)` (desc), lalu `matched(R)` (desc) sebagai tie-breaker.
4. **Kerusakan Paling Mungkin** = rule peringkat #1.
5. **Kemungkinan Lain** = rule peringkat #2–#5 (maks 4), ditampilkan dalam bentuk accordion/collapsible.
6. Jika tidak ada rule yang lolos filter sama sekali → tampilkan **state "Tidak ada kecocokan signifikan"** dengan saran: coba pilih gejala tambahan, atau langsung sarankan periksa ke bengkel.

**Klasifikasi label tingkat kecocokan** (untuk ditampilkan sebagai badge, bukan hanya angka):
| Persentase | Label |
|---|---|
| ≥ 75% | "Sangat Mungkin" |
| 50%–74% | "Cukup Mungkin" |
| 30%–49% | "Mungkin" |
| < 30% | (tidak ditampilkan, sesuai aturan filter) |

### 5.6 Hasil Diagnosa

Konten yang ditampilkan untuk **Kerusakan Paling Mungkin**:

- **Nama kerusakan** (dari `kerusakan`), contoh: "CVT Slip".
- **Badge tingkat kecocokan** (persentase + label, §5.5).
- **Gejala yang cocok** — daftar gejala yang dipilih pengguna DAN ada di rule ini (centang hijau).
- **Gejala lain pada pola ini yang tidak Anda alami** — gejala di rule ini yang TIDAK dipilih pengguna (opsional, bantu transparansi "kenapa skornya segini").
- **Penyebab** — 2–4 poin penyebab umum (dari `data/penyebab_saran.json`, lihat §6.5).
- **Saran Penanganan** — langkah-langkah awam yang aman dilakukan sendiri + kapan harus ke bengkel. Diberi level urgensi:
  - 🟢 **Bisa dipantau** — belum mendesak.
  - 🟡 **Sebaiknya segera diperiksa** — dalam beberapa hari.
  - 🔴 **Segera ke bengkel / berhenti berkendara** — risiko keselamatan (contoh: rem blong, kompresi bocor parah).
- **"Kemungkinan Lain"** — collapsible list rule #2–#5 dengan nama + persentase, masing-masing bisa diklik untuk expand detail penyebab & saran singkat.
- Tombol aksi: **"Diagnosa Ulang"**, **"Ubah Pilihan Gejala"**, **"Bagikan/Cetak Hasil"** (opsional v1.1 — generate ringkasan teks yang bisa di-copy untuk ditunjukkan ke mekanik).

---

## 6. Spesifikasi Data & Konten

### 6.1 `gejala_master.json`
```json
{ "G001": "Air berkurang", "G002": "Air masuk ke rumah lampu", ... }
```
697 entri, sudah final, tidak perlu diubah.

### 6.2 `rules.json`
```json
[
  {
    "id": "K01",
    "bagian": "CVT",
    "kerusakan": "CVT slip",
    "gejala_codes": ["G612","G422","G040","G076","G011","G154","G032"],
    "gejala_names": ["Tarikan berat","RPM naik tapi laju lambat", "..."]
  }
]
```
310 entri, sudah final.

### 6.3 `kategori_sistem.json`
9 entri (lihat §5.2), masing-masing:
```json
{
  "id": "cvt",
  "nama": "CVT & Transmisi Otomatis",
  "deskripsi": "...",
  "bagian_terkait": ["CVT"],
  "jumlah_rule": 74,
  "icon": "circle-gauge"
}
```

### 6.4 `keluhan_utama.json` — **HARUS DIBUAT**

Untuk setiap kategori sistem, 4–8 entri:
```json
{
  "kategori_id": "cvt",
  "id": "cvt-tarikan-berat",
  "label_awam": "Motor terasa berat / tarikan kurang responsif",
  "gejala_anchor": ["G612"],
  "rule_ids_terkait": ["K01","K18","K48","..."]
}
```
Dibuat melalui script data-prep (frekuensi gejala) + kurasi label bahasa awam manual.

### 6.5 `penyebab_saran.json` — **GAP UTAMA, HARUS DIBUAT**

290 kerusakan unik membutuhkan entri penyebab & saran. Struktur:
```json
{
  "CVT slip": {
    "penyebab": [
      "Per CVT (per kopling) sudah lemah/aus",
      "Permukaan kampas ganda licin akibat oli/kotoran",
      "Roller CVT sudah gepeng/aus tidak rata"
    ],
    "saran": [
      { "teks": "Bersihkan area CVT dari debu dan oli yang menempel", "level": "bisa_dipantau" },
      { "teks": "Cek dan ganti roller serta per CVT jika sudah melewati jarak servis (umumnya 8.000–10.000 km)", "level": "segera_diperiksa" },
      { "teks": "Jika disertai bau gosong kuat atau tarikan tiba-tiba hilang, segera ke bengkel", "level": "segera_bengkel" }
    ]
  }
}
```

**Rencana pengisian konten (untuk code agent / tim konten):**
1. Generate draft awal untuk 290 kerusakan menggunakan LLM (prompt terpisah, lihat Lampiran B), dengan grounding pada `gejala_names` rule terkait agar penyebab & saran relevan secara teknis.
2. Tandai semua entri hasil generate dengan flag `"reviewed": false`.
3. Idealnya direview oleh seseorang yang paham otomotif (dosen/mentor) sebelum publish — minimal untuk kategori dengan implikasi keselamatan (Rem, Pengapian, Mesin/Overheat).
4. Untuk MVP/demo akademik, draft hasil LLM + disclaimer yang jelas sudah cukup, **selama disclaimer di Beranda & Hasil Diagnosa konsisten ditampilkan**.

---

## 7. Tech Stack (Sederhana)

Karena ini proyek skala kecil/akademik dan seluruh logika (forward chaining) bersifat deterministik berbasis data statis, **tidak diperlukan backend/database**.

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | **HTML + CSS + JavaScript (vanilla, ES Modules)**, atau opsional **Vite + vanilla TS** untuk dev experience | Tanpa framework besar (React/Vue tidak perlu untuk kompleksitas ini); build step opsional, output tetap static files |
| Data | File JSON statis (`gejala_master.json`, `rules.json`, `kategori_sistem.json`, `keluhan_utama.json`, `penyebab_saran.json`) | Tidak butuh DB, mudah diaudit/diedit, versionable di Git |
| State management | Vanilla JS state object + `sessionStorage` (state diagnosa per sesi), `localStorage` (riwayat opsional) | Cukup untuk flow linear |
| Styling | CSS murni dengan custom properties (CSS variables) untuk tema; tanpa Tailwind kecuali sudah familiar | Kontrol penuh terhadap desain, hindari "templated" look |
| Hosting | Static hosting (GitHub Pages / Netlify / Vercel static) | Gratis, tidak perlu server |
| Bahasa | Bahasa Indonesia di seluruh UI | Target pengguna awam Indonesia |

**Struktur folder yang disarankan:**
```
maticcare/
├── index.html
├── src/
│   ├── main.js
│   ├── router.js          // routing sederhana antar "halaman" (hash-based)
│   ├── views/
│   │   ├── beranda.js
│   │   ├── pilih-sistem.js
│   │   ├── pilih-keluhan.js
│   │   ├── pilih-gejala.js
│   │   └── hasil-diagnosa.js
│   ├── lib/
│   │   ├── diagnose.js     // forward chaining + scoring
│   │   └── state.js
│   └── styles/
│       └── main.css
├── data/
│   ├── gejala_master.json
│   ├── rules.json
│   ├── kategori_sistem.json
│   ├── keluhan_utama.json
│   └── penyebab_saran.json
└── README.md
```

---

## 8. UI/UX Guidelines — "Jangan AI Slop"

Hindari pola desain generik/klise yang sering dihasilkan AI tanpa arahan, antara lain:
- ❌ Gradient ungu-biru besar di hero section dengan headline generik ("Welcome to the Future of...").
- ❌ Glassmorphism/neumorphism berlebihan, drop-shadow di mana-mana.
- ❌ Ikon emoji generik atau ikon stok yang tidak relevan dengan konteks motor.
- ❌ Statistik palsu/testimoni fiktif.
- ❌ Layout "card grid" generik tanpa hierarki visual yang jelas.

**Arahan desain yang diinginkan:**
- **Mood**: terasa seperti *tool diagnosa praktis* (mirip tampilan dashboard OBD scanner atau form servis bengkel digital) — fungsional, rapi, terpercaya. Bukan landing page startup.
- **Palet warna**: dasar netral (putih/abu sangat terang atau charcoal gelap untuk dark mode), dengan **satu warna aksen fungsional** — misal oranye/amber (mengasosiasikan dengan "warning lamp"/indikator dashboard motor) untuk CTA dan highlight status, hijau untuk "cocok"/aman, merah untuk "segera ke bengkel".
- **Tipografi**: satu sans-serif yang jelas dan mudah dibaca di mobile (sistem font / font seperti Inter, atau font lokal yang sudah tersedia), ukuran cukup besar untuk pengguna yang mungkin membaca sambil berdiri di pinggir jalan.
- **Iconography**: gunakan ikon yang relevan secara literal (komponen motor: roda gigi/CVT, busi, aki, rem cakram, knalpot) — bukan ikon abstrak generik. Set ikon seperti Lucide cukup, tapi pilih ikon yang representatif per kategori (sudah disarankan di `kategori_sistem.json`).
- **Progress indicator**: tampilkan step 1–5 (Sistem → Keluhan → Gejala → Proses → Hasil) secara eksplisit di bagian atas, agar pengguna tahu posisinya — penting untuk pengguna awam agar tidak merasa "tersesat".
- **Mobile-first**: target utama adalah layar HP (360–430px width). Tombol besar, checklist mudah ditekan jari (min. 44px tap target).
- **Microcopy**: gunakan bahasa percakapan yang ramah, hindari jargon. Contoh: bukan "Initialize Diagnosis Engine" tapi "Mulai Diagnosa".
- **Hasil diagnosa**: desain seperti "kartu hasil pemeriksaan", dengan badge persentase yang jelas (bukan progress bar generik bertema gradient), dan pemisahan visual yang jelas antara Penyebab vs Saran.

---

## 9. Non-Functional Requirements

- **Performa**: First load < 2 detik di koneksi 3G (semua data JSON < total ~300KB, lakukan minifikasi bila perlu).
- **Aksesibilitas**: kontras warna memenuhi WCAG AA, semua checkbox/radio dapat dioperasikan keyboard, label ARIA yang sesuai.
- **Responsif**: berfungsi baik di lebar 320px–1440px.
- **Bahasa**: 100% Bahasa Indonesia.
- **Tidak menyimpan data pribadi** — tidak ada PII yang dikumpulkan di MVP.
- **Disclaimer** harus tampil di Beranda dan di setiap Hasil Diagnosa.

---

## 10. Milestone / Roadmap

**MVP (v1.0)**
- Beranda + disclaimer
- Flow lengkap: Pilih Sistem → Keluhan Utama → Gejala → Proses → Hasil
- Forward chaining + scoring sesuai §5.5
- Data lengkap: gejala_master, rules, kategori_sistem (sudah tersedia), keluhan_utama (perlu dibuat), penyebab_saran (perlu dibuat — minimal untuk kategori CVT, Mesin, Rem, Kelistrikan, Pengapian sebagai prioritas karena paling sering)
- UI sesuai guideline §8, mobile-first

**v1.1 (nice-to-have)**
- Riwayat diagnosa (localStorage)
- Fitur "Bagikan/Cetak hasil" (export teks ringkas)
- Lengkapi `penyebab_saran.json` untuk seluruh 290 kerusakan + review domain expert
- Pencarian gejala (search box) sebagai alternatif checklist panjang
- Mode gelap

**v2.0 (future)**
- Tracking riwayat servis per kendaraan (butuh backend + akun)
- Estimasi biaya perbaikan per kerusakan
- Integrasi lokasi bengkel terdekat (Maps)

---

## 11. Acceptance Criteria (MVP)

1. Pengguna dapat menyelesaikan seluruh flow dari Beranda hingga Hasil Diagnosa tanpa error, untuk minimal 1 kombinasi gejala di setiap dari 9 kategori sistem.
2. Untuk kombinasi gejala yang identik dengan `gejala_codes` suatu rule (100% match), rule tersebut **harus** muncul sebagai "Kerusakan Paling Mungkin" dengan kecocokan 100%.
3. Jika gejala yang dipilih tidak cocok dengan rule apa pun (≥30%) di kategori tersebut, sistem menampilkan state "tidak ada kecocokan signifikan" dengan saran lanjutan, **bukan error/crash**.
4. Seluruh teks UI dalam Bahasa Indonesia, tidak ada kode `Gxxx`/`Kxxx` yang terekspos ke pengguna akhir.
5. Disclaimer tampil di Beranda dan Hasil Diagnosa.
6. Aplikasi dapat dijalankan hanya dengan static file server (tanpa backend/database).
7. Tampilan rapi dan dapat digunakan di lebar layar 360px (HP umum) tanpa horizontal scroll/elemen terpotong.

---

## Lampiran A — Berkas Data yang Disertakan

- `data/gejala_master.json` (697 gejala)
- `data/rules.json` (310 rule)
- `data/kategori_sistem.json` (9 kategori)

> File `keluhan_utama.json` dan `penyebab_saran.json` **belum tersedia** dan menjadi bagian dari tugas implementasi (lihat prompt code agent, Lampiran B).

## Lampiran B

Lihat berkas terpisah `PROMPT_FOR_CODE_AGENT.md`.
