import { getState, updateState } from '../lib/state.js';
import { navigateTo } from '../router.js';

/**
 * Renders the Pilih Keluhan view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  const state = getState();
  const response = await fetch('/data/keluhan_utama.json');
  const allComplaints = await response.json();

  // Filter complaints by selected category
  const filteredComplaints = allComplaints.filter(
    c => c.kategori_id === state.selectedCategoryId
  );

  container.innerHTML = `
    <div>
      <h1>Pilih Keluhan Utama</h1>
      <p class="subtitle">Pilih masalah utama yang paling menggambarkan kondisi motor matic Anda saat ini.</p>
    </div>

    <form class="complaint-list" id="complaint-form">
      ${filteredComplaints.map(c => `
        <label class="complaint-option">
          <input type="radio" name="keluhan" value="${c.id}" class="complaint-input" 
            ${state.selectedKeluhanId === c.id ? 'checked' : ''}>
          <span class="complaint-box">${c.label_awam}</span>
        </label>
      `).join('')}
      
      <!-- Fallback Option -->
      <label class="complaint-option">
        <input type="radio" name="keluhan" value="lainnya" class="complaint-input"
          ${state.selectedKeluhanId === 'lainnya' ? 'checked' : ''}>
        <span class="complaint-box">Gejala saya tidak ada di daftar ini / lainnya</span>
      </label>
    </form>

    <div class="gejala-actions">
      <button type="button" class="btn btn-primary" id="btn-next" disabled>
        Lanjut
        <!-- Arrow Right -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
      <button type="button" class="btn btn-secondary" id="btn-back">
        <!-- Arrow Left -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali
      </button>
    </div>
  `;

  const form = container.querySelector('#complaint-form');
  const btnNext = container.querySelector('#btn-next');
  const btnBack = container.querySelector('#btn-back');

  // Enable/disable next button based on selection
  const checkSelection = () => {
    const selected = form.querySelector('input[name="keluhan"]:checked');
    btnNext.disabled = !selected;
  };

  form.addEventListener('change', checkSelection);
  
  // Initial check (in case user came back and radio is already checked)
  checkSelection();

  btnNext.addEventListener('click', () => {
    const selected = form.querySelector('input[name="keluhan"]:checked');
    if (selected) {
      const val = selected.value;
      
      // Update state
      updateState({
        selectedKeluhanId: val,
        // Reset symptoms and results if they changed their keluhan utama selection
        selectedGejalaCodes: val === state.selectedKeluhanId ? state.selectedGejalaCodes : [],
        diagnosticResults: val === state.selectedKeluhanId ? state.diagnosticResults : null
      });

      navigateTo('#/pilih-gejala');
    }
  });

  btnBack.addEventListener('click', () => {
    navigateTo('#/pilih-sistem');
  });
}
