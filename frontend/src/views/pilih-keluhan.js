import { getState, updateState } from '../lib/state.js';
import { navigateTo } from '../router.js';
import { apiClient } from '../api/client.js';

/**
 * Renders the Pilih Keluhan view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  const state = getState();
  
  container.innerHTML = `
    <div>
      <h1>Pilih Keluhan Utama</h1>
      <p class="subtitle">Pilih masalah utama yang paling menggambarkan kondisi motor matic Anda saat ini.</p>
    </div>
    <div id="complaint-container" class="loading-state">
      <p>Memuat daftar keluhan...</p>
    </div>
    <div class="gejala-actions">
      <button type="button" class="btn btn-primary" id="btn-next" disabled>
        Lanjut
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
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

  const btnNext = container.querySelector('#btn-next');
  const btnBack = container.querySelector('#btn-back');

  btnBack.addEventListener('click', () => {
    navigateTo('#/pilih-sistem');
  });

  try {
    const complaints = await apiClient.getKeluhan(state.selectedCategoryId);
    const listContainer = container.querySelector('#complaint-container');
    listContainer.classList.remove('loading-state');

    listContainer.innerHTML = `
      <form class="complaint-list" id="complaint-form">
        ${complaints.map(c => `
          <label class="complaint-option">
            <input type="radio" name="keluhan" value="${c.id}" class="complaint-input" 
              ${state.selectedKeluhanId === c.id ? 'checked' : ''}>
            <span class="complaint-box">${c.label_awam}</span>
          </label>
        `).join('')}
      </form>
    `;

    const form = listContainer.querySelector('#complaint-form');

    const checkSelection = () => {
      const selected = form.querySelector('input[name="keluhan"]:checked');
      btnNext.disabled = !selected;
    };

    form.addEventListener('change', checkSelection);
    checkSelection();

    btnNext.addEventListener('click', () => {
      const selected = form.querySelector('input[name="keluhan"]:checked');
      if (selected) {
        const val = selected.value;
        
        updateState({
          selectedKeluhanId: val,
          selectedGejalaCodes: val === state.selectedKeluhanId ? state.selectedGejalaCodes : [],
          diagnosticResults: val === state.selectedKeluhanId ? state.diagnosticResults : null
        });

        navigateTo('#/pilih-gejala');
      }
    });

  } catch (error) {
    const listContainer = container.querySelector('#complaint-container');
    listContainer.classList.remove('loading-state');
    listContainer.innerHTML = `
      <div class="error-state">
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Coba Lagi</button>
      </div>
    `;
  }
}
