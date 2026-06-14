import { getState, updateState } from '../lib/state.js';
import { navigateTo } from '../router.js';
import { apiClient } from '../api/client.js';

/**
 * Renders the Pilih Gejala view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  const state = getState();

  container.innerHTML = `
    <div>
      <h1>Pilih Gejala Tambahan</h1>
      <p class="subtitle">Beri tanda centang pada semua gejala lain yang Anda rasakan pada motor matic Anda.</p>
    </div>

    <div id="gejala-container" class="loading-state">
      <p>Memuat daftar gejala...</p>
    </div>

    <div class="gejala-actions">
      <button type="button" class="btn btn-primary" id="btn-diagnose" disabled>
        Proses Diagnosa
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      </button>
      <button type="button" class="btn btn-secondary" id="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali
      </button>
    </div>
  `;

  const btnDiagnose = container.querySelector('#btn-diagnose');
  const btnBack = container.querySelector('#btn-back');

  btnBack.addEventListener('click', () => {
    navigateTo('#/pilih-keluhan');
  });

  try {
    const data = await apiClient.getGejala(state.selectedKeluhanId);
    const listContainer = container.querySelector('#gejala-container');
    listContainer.classList.remove('loading-state');

    const sortedSymptomData = data.gejala;
    
    listContainer.innerHTML = `
      <form class="gejala-checklist" id="gejala-form"></form>
      <div class="show-more-wrapper hidden" id="show-more-container">
        <button type="button" class="btn-link" id="btn-show-more">Tampilkan semua gejala lainnya (+0)</button>
      </div>
    `;

    const form = listContainer.querySelector('#gejala-form');
    const showMoreContainer = listContainer.querySelector('#show-more-container');
    const btnShowMore = listContainer.querySelector('#btn-show-more');

    const INITIAL_LIMIT = 15;
    let showAll = sortedSymptomData.length <= INITIAL_LIMIT;

    // Initialize activeChecked from state or pre_checked from API
    let activeChecked = new Set(state.selectedGejalaCodes);
    if (activeChecked.size === 0) {
      sortedSymptomData.filter(g => g.pre_checked).forEach(g => activeChecked.add(g.code));
    }

    const renderChecklist = () => {
      const visibleData = showAll ? sortedSymptomData : sortedSymptomData.slice(0, INITIAL_LIMIT);
      
      form.innerHTML = visibleData.map(g => {
        const isChecked = activeChecked.has(g.code);
        return `
          <label class="gejala-option">
            <input type="checkbox" name="gejala" value="${g.code}" class="gejala-input"
              ${isChecked ? 'checked' : ''}>
            <span class="gejala-box">${g.nama} ${g.pre_checked ? '<strong>(Keluhan Anda)</strong>' : ''}</span>
          </label>
        `;
      }).join('');

      if (!showAll && sortedSymptomData.length > INITIAL_LIMIT) {
        const remainingCount = sortedSymptomData.length - INITIAL_LIMIT;
        btnShowMore.textContent = `Tampilkan semua gejala lainnya (+${remainingCount})`;
        showMoreContainer.classList.remove('hidden');
      } else {
        showMoreContainer.classList.add('hidden');
      }

      validateSelection();
    };

    const validateSelection = () => {
      btnDiagnose.disabled = activeChecked.size === 0;
    };

    form.addEventListener('change', (e) => {
      if (e.target.name === 'gejala') {
        const code = e.target.value;
        if (e.target.checked) {
          activeChecked.add(code);
        } else {
          activeChecked.delete(code);
        }
        validateSelection();
      }
    });

    btnShowMore.addEventListener('click', () => {
      showAll = true;
      renderChecklist();
    });

    btnDiagnose.addEventListener('click', () => {
      const selectedGejalaCodes = Array.from(activeChecked);
      updateState({ selectedGejalaCodes });
      navigateTo('#/proses');
    });

    renderChecklist();

  } catch (error) {
    const listContainer = container.querySelector('#gejala-container');
    listContainer.classList.remove('loading-state');
    listContainer.innerHTML = `
      <div class="error-state">
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Coba Lagi</button>
      </div>
    `;
  }
}
