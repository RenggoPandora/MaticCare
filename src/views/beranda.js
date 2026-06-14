import { resetState } from '../lib/state.js';

/**
 * Renders the home page (Beranda) view.
 * @param {HTMLElement} container - The element to render the view into
 */
export function render(container) {
  // Reset diagnostic state whenever returning to Beranda
  resetState();

  container.innerHTML = `
    <div class="hero-scanner">
      <div class="scanner-radar">
        <!-- Diagnostic Radar Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      </div>
      <h1>Deteksi Kerusakan Motor Matic Anda</h1>
      <p class="subtitle">Sistem pakar pelacak otomatis untuk mengidentifikasi indikasi masalah transmisi CVT dan komponen motor matic.</p>
      
      <a href="#/pilih-sistem" class="btn btn-primary" id="btn-start">
        Mulai Diagnosa
        <!-- Arrow Right Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>

    <div class="intro-steps">
      <div class="intro-step-item">
        <div class="step-badge">1</div>
        <div class="step-info">
          <h3>Pilih Sistem Bermasalah</h3>
          <p>Tentukan kategori komponen yang Anda curigai bermasalah (misal: CVT, Rem, Kelistrikan).</p>
        </div>
      </div>
      
      <div class="intro-step-item">
        <div class="step-badge">2</div>
        <div class="step-info">
          <h3>Pilih Keluhan &amp; Gejala</h3>
          <p>Pilih keluhan utama dan ceklis gejala fisik yang Anda rasakan pada motor matic Anda.</p>
        </div>
      </div>
      
      <div class="intro-step-item">
        <div class="step-badge">3</div>
        <div class="step-info">
          <h3>Dapatkan Hasil Deteksi</h3>
          <p>Sistem menganalisis pola gejala Anda dan menyajikan indikasi kerusakan, penyebab, serta saran tindakan.</p>
        </div>
      </div>
    </div>

    <div class="home-disclaimer">
      <div class="disclaimer-icon">
        <!-- Warning Octagon Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="disclaimer-content">
        <strong>PENTING:</strong> Hasil diagnosa dari MaticCare merupakan analisis indikasi awal berbasis sistem pakar. Aplikasi ini bersifat edukatif/edukasi mandiri dan tidak menggantikan pemeriksaan mekanik profesional di bengkel.
      </div>
    </div>
  `;
}
