import { getState, updateState, resetGejala } from '../lib/state.js';
import { navigateTo } from '../router.js';

/**
 * Renders the Hasil Diagnosa view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  const state = getState();
  const results = state.diagnosticResults;

  if (!results) {
    navigateTo('#/pilih-sistem');
    return;
  }

  // Load Penyebab & Saran database
  const [penyebabSaranRes, categoriesRes] = await Promise.all([
    fetch('/data/penyebab_saran.json').then(r => r.json()),
    fetch('/data/kategori_sistem.json').then(r => r.json())
  ]);

  const categoryDef = categoriesRes.find(c => c.id === state.selectedCategoryId);

  // If there are no rules matching >= 30% (empty state)
  if (!results.top) {
    renderEmptyState(container, categoryDef);
    return;
  }

  // Helper to fetch penyebab & saran with fallback
  const getPenyebabSaran = (damageName) => {
    return penyebabSaranRes[damageName] || {
      penyebab: [
        "Terjadi keausan atau penurunan performa fisik pada komponen terkait.",
        "Kondisi pemakaian motor dalam jangka panjang tanpa perawatan berkala."
      ],
      saran: [
        { teks: "Periksakan kondisi fisik komponen terkait ke bengkel resmi atau kepercayaan Anda.", level: "segera_diperiksa" },
        { teks: "Lakukan pembersihan dan penyetelan ulang pada komponen.", level: "bisa_dipantau" }
      ],
      reviewed: false
    };
  };

  const topData = getPenyebabSaran(results.top.kerusakan);
  const topCertaintyClass = results.top.percentage >= 75 ? 'sangat-mungkin' : (results.top.percentage >= 50 ? 'cukup-mungkin' : 'mungkin');

  // Build sharing text summary
  const shareText = buildShareText(categoryDef.nama, results.top, topData);

  container.innerHTML = `
    <div>
      <h1>Hasil Diagnosa</h1>
      <p class="subtitle">Indikasi kerusakan paling mungkin berdasarkan gejala yang Anda laporkan.</p>
    </div>

    <!-- Primary Result Card -->
    <div class="hasil-card">
      <div class="hasil-header">
        <div class="hasil-meta">
          <span class="hasil-label-kategori">${categoryDef.nama}</span>
          <span class="certainty-badge ${topCertaintyClass}">
            <!-- Badge Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            ${results.top.percentage}% — ${results.top.label}
          </span>
        </div>
        <div class="hasil-title">${results.top.kerusakan}</div>
      </div>

      <!-- Symptoms Match/Unmatch -->
      <div class="symptom-comparison">
        <div class="symptom-comparison-title">Analisis Gejala:</div>
        <div class="symptom-comparison-list">
          ${results.top.gejala_cocok.map(g => `
            <div class="symptom-comparison-item match">
              <span class="symptom-icon match">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span>${g.name} <strong>(Cocok)</strong></span>
            </div>
          `).join('')}

          ${results.top.gejala_tidak_cocok.map(g => `
            <div class="symptom-comparison-item unmatch">
              <span class="symptom-icon unmatch">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </span>
              <span>${g.name} <em>(Tidak Anda keluhkan)</em></span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Causes -->
      <div class="penyebab-section">
        <div class="section-title-icon">
          <!-- Tool Wrench Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          Kemungkinan Penyebab:
        </div>
        <ul class="penyebab-list">
          ${topData.penyebab.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <!-- Suggestions / Advice -->
      <div class="saran-section">
        <div class="section-title-icon">
          <!-- Clipboard/Alert Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          Saran Penanganan:
        </div>
        <div class="saran-list">
          ${topData.saran.map(s => {
            const urgencyClass = `level-${s.level}`;
            let levelLabel = "Bisa Dipantau";
            let levelIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

            if (s.level === 'segera_diperiksa') {
              levelLabel = "Sebaiknya Segera Diperiksa";
              levelIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
            } else if (s.level === 'segera_bengkel') {
              levelLabel = "SEGERA KE BENGKEL";
              levelIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
            }

            return `
              <div class="saran-item ${urgencyClass}">
                <span class="saran-level-indicator">${levelIcon}</span>
                <div class="saran-item-content">
                  <span class="saran-level-tag">${levelLabel}</span>
                  <span class="saran-text">${s.teks}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Reviewed Flag Alert -->
      ${!topData.reviewed ? `
        <div style="font-size: 11px; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 12px; display: flex; gap: 6px; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Catatan: Konten penyebab &amp; saran di atas adalah rekomendasi otomatis berbasis aturan dan belum ditinjau penuh oleh ahli otomotif.</span>
        </div>
      ` : ''}
    </div>

    <!-- Alternatives / Accordion -->
    ${results.alternatif.length > 0 ? `
      <div class="alternatif-section">
        <div class="alternatif-title">Kemungkinan Lain (${results.alternatif.length}):</div>
        <div class="accordion-container">
          ${results.alternatif.map((alt, index) => {
            const altData = getPenyebabSaran(alt.kerusakan);
            return `
              <div class="accordion-item" data-index="${index}">
                <div class="accordion-header">
                  <div class="accordion-header-left">
                    <div class="accordion-item-title">${alt.kerusakan}</div>
                    <div class="accordion-item-meta">
                      <span class="accordion-percent">${alt.percentage}% Cocok</span>
                      <span class="accordion-label">• ${alt.label}</span>
                    </div>
                  </div>
                  <span class="accordion-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
                <div class="accordion-content">
                  <div class="symptom-comparison-title" style="font-size: 12px; margin-bottom: 4px;">Gejala Cocok:</div>
                  <div class="symptom-comparison-list" style="margin-bottom: 12px;">
                    ${alt.gejala_cocok.map(g => `
                      <div class="symptom-comparison-item match" style="font-size: 12px;">
                        <span class="symptom-icon match" style="color: var(--color-success);">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                        <span>${g.name}</span>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div class="symptom-comparison-title" style="font-size: 12px; margin-bottom: 4px;">Penyebab:</div>
                  <ul class="penyebab-list" style="margin-bottom: 12px;">
                    ${altData.penyebab.map(p => `<li style="font-size: 12px;">${p}</li>`).join('')}
                  </ul>

                  <div class="symptom-comparison-title" style="font-size: 12px; margin-bottom: 4px;">Saran Pertama:</div>
                  <div class="saran-list">
                    <div class="saran-item level-${altData.saran[0]?.level || 'bisa_dipantau'}" style="padding: 8px;">
                      <span class="saran-text" style="font-size: 12px;">${altData.saran[0]?.teks || 'Bawa ke bengkel terdekat.'}</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Sharing Section -->
    <div class="share-section">
      <div class="share-title">Bagikan Hasil Diagnosa:</div>
      <div class="share-copy-area">
        <textarea class="share-textarea" readonly id="share-text-area">${shareText}</textarea>
        <button class="btn btn-primary btn-share-copy" id="btn-copy">
          <!-- Copy Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Salin
        </button>
      </div>
      <div id="copy-toast" style="font-size: 12px; color: var(--color-success); text-align: center; display: none;">
        Teks berhasil disalin ke clipboard!
      </div>
    </div>

    <!-- Actions -->
    <div class="gejala-actions">
      <button type="button" class="btn btn-secondary" id="btn-edit-gejala">
        <!-- Edit Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Ubah Pilihan Gejala
      </button>
      
      <button type="button" class="btn btn-primary" id="btn-reset">
        <!-- Refresh Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        Diagnosa Baru (Reset)
      </button>
    </div>
  `;

  // Attach Accordion Toggle Click Handlers
  const accordionItems = container.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close other accordions
      accordionItems.forEach(i => i.classList.remove('open'));
      
      // Toggle current accordion
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Attach Copy to Clipboard Handler
  const btnCopy = container.querySelector('#btn-copy');
  const copyArea = container.querySelector('#share-text-area');
  const copyToast = container.querySelector('#copy-toast');
  
  btnCopy.addEventListener('click', () => {
    copyArea.select();
    copyArea.setSelectionRange(0, 99999); // For mobile devices
    try {
      navigator.clipboard.writeText(copyArea.value);
      copyToast.style.display = 'block';
      setTimeout(() => {
        copyToast.style.display = 'none';
      }, 2500);
    } catch (err) {
      // Fallback if Clipboard API fails
      document.execCommand('copy');
      copyToast.style.display = 'block';
      setTimeout(() => {
        copyToast.style.display = 'none';
      }, 2500);
    }
  });

  // Action listeners
  container.querySelector('#btn-edit-gejala').addEventListener('click', () => {
    // Keep category and keluhan, clear checked symptoms in state, then reload symptom view
    resetGejala();
    navigateTo('#/pilih-gejala');
  });

  container.querySelector('#btn-reset').addEventListener('click', () => {
    navigateTo('#/');
  });
}

/**
 * Renders the state of "No Match Found" (≥ 30%).
 * @param {HTMLElement} container - Container to render into
 * @param {Object} categoryDef - Category definition
 */
function renderEmptyState(container, categoryDef) {
  container.innerHTML = `
    <div class="empty-state-container">
      <div class="empty-state-icon">
        <!-- Shield Alert / Info Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="empty-state-title">Tidak Ada Kecocokan Signifikan</div>
      <div class="empty-state-desc">
        Kombinasi gejala yang Anda pilih tidak cocok dengan pola kerusakan yang ada di sistem kami (kurang dari batas minimal 30%).
      </div>

      <div class="empty-state-saran-box">
        <strong>Saran Tindakan:</strong>
        <ol style="margin-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
          <li>Silakan klik <strong>"Ubah Pilihan Gejala"</strong> di bawah untuk memilih ulang atau menambahkan gejala lain.</li>
          <li>Pastikan memilih keluhan utama yang paling mencerminkan kondisi awal.</li>
          <li>Bila kondisi motor terus bermasalah, segera periksakan ke mekanik terpercaya di bengkel.</li>
        </ol>
      </div>
    </div>

    <div class="gejala-actions">
      <button type="button" class="btn btn-secondary" id="btn-empty-edit">
        <!-- Edit Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Ubah Pilihan Gejala
      </button>
      
      <button type="button" class="btn btn-primary" id="btn-empty-reset">
        <!-- Refresh Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        Diagnosa Baru (Reset)
      </button>
    </div>
  `;

  container.querySelector('#btn-empty-edit').addEventListener('click', () => {
    resetGejala();
    navigateTo('#/pilih-gejala');
  });

  container.querySelector('#btn-empty-reset').addEventListener('click', () => {
    navigateTo('#/');
  });
}

/**
 * Compiles a formatted text report of the diagnostic findings.
 * @param {string} categoryName - Selected system category
 * @param {Object} topRule - The ranked #1 matching rule
 * @param {Object} data - Causes and advice from database
 * @returns {string} Compiled plain-text report
 */
function buildShareText(categoryName, topRule, data) {
  const matchingSymptomsText = topRule.gejala_cocok
    .map(g => `- ${g.name}`)
    .join('\n');

  const causesText = data.penyebab
    .map((p, idx) => `${idx + 1}. ${p}`)
    .join('\n');

  const adviceText = data.saran
    .map((s, idx) => {
      let lvl = "Bisa dipantau";
      if (s.level === 'segera_diperiksa') lvl = "Segera periksa";
      if (s.level === 'segera_bengkel') lvl = "WAJIB BENGKEL";
      return `${idx + 1}. ${s.teks} [Urgen: ${lvl}]`;
    })
    .join('\n');

  return `--- HASIL DIAGNOSA MATICCARE ---
Sistem: ${categoryName}
Kerusakan Terdeteksi: ${topRule.kerusakan}
Tingkat Kecocokan: ${topRule.percentage}% (${topRule.label})

Gejala yang Dialami:
${matchingSymptomsText}

Kemungkinan Penyebab:
${causesText}

Saran Penanganan:
${adviceText}

*Hasil diagnosa bersifat indikasi awal. Harap periksa ke bengkel terdekat demi keselamatan berkendara.`;
}
