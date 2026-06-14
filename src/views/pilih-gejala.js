import { getState, updateState } from '../lib/state.js';
import { navigateTo } from '../router.js';

/**
 * Renders the Pilih Gejala view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  const state = getState();

  // Load JSON datasets
  const [rulesRes, categoriesRes, complaintsRes, symptomsMasterRes] = await Promise.all([
    fetch('/data/rules.json').then(r => r.json()),
    fetch('/data/kategori_sistem.json').then(r => r.json()),
    fetch('/data/keluhan_utama.json').then(r => r.json()),
    fetch('/data/gejala_master.json').then(r => r.json())
  ]);

  // Find the selected category definition
  const categoryDef = categoriesRes.find(c => c.id === state.selectedCategoryId);
  if (!categoryDef) {
    navigateTo('#/pilih-sistem');
    return;
  }

  // Filter rules belonging to this category
  const categoryRules = rulesRes.filter(rule => {
    return categoryDef.bagian_terkait.some(
      bagian => rule.bagian.toUpperCase() === bagian.toUpperCase()
    );
  });

  let targetRules = [];
  let anchors = [];

  if (state.selectedKeluhanId === 'lainnya') {
    // If "lainnya", target all rules in the category
    targetRules = categoryRules;
  } else {
    // Find complaint definition
    const complaintDef = complaintsRes.find(c => c.id === state.selectedKeluhanId);
    if (complaintDef) {
      anchors = complaintDef.gejala_anchor || [];
      // Filter rules in the category that contain any of the anchor symptoms
      targetRules = categoryRules.filter(rule => {
        return anchors.some(anchorCode => rule.gejala_codes.includes(anchorCode));
      });
    } else {
      targetRules = categoryRules;
    }
  }

  // Calculate frequency of symptoms in the target ruleset
  const freq = {};
  targetRules.forEach(rule => {
    rule.gejala_codes.forEach(code => {
      freq[code] = (freq[code] || 0) + 1;
    });
  });

  // Sort all unique symptom codes in the target ruleset by frequency descending
  const sortedSymptomCodes = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

  // Pre-load previously checked symptoms (if any)
  // If state is empty, pre-check the anchors
  let activeChecked = new Set(state.selectedGejalaCodes);
  if (activeChecked.size === 0 && anchors.length > 0) {
    anchors.forEach(a => activeChecked.add(a));
  }

  container.innerHTML = `
    <div>
      <h1>Pilih Gejala Tambahan</h1>
      <p class="subtitle">Beri tanda centang pada semua gejala lain yang Anda rasakan pada motor matic Anda.</p>
    </div>

    <div class="gejala-meta">
      Sistem: <strong>${categoryDef.nama}</strong>
      ${state.selectedKeluhanId !== 'lainnya' ? `<br>Keluhan Utama: <em>${complaintsRes.find(c => c.id === state.selectedKeluhanId)?.label_awam || ''}</em>` : ''}
    </div>

    <form class="gejala-checklist" id="gejala-form">
      <!-- Symptoms will be generated dynamically -->
    </form>

    <div class="show-more-wrapper hidden" id="show-more-container">
      <button type="button" class="btn-link" id="btn-show-more">Tampilkan semua gejala lainnya (+0)</button>
    </div>

    <div class="gejala-actions">
      <button type="button" class="btn btn-primary" id="btn-diagnose" disabled>
        Proses Diagnosa
        <!-- Radar Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
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

  const form = container.querySelector('#gejala-form');
  const btnDiagnose = container.querySelector('#btn-diagnose');
  const btnBack = container.querySelector('#btn-back');
  const showMoreContainer = container.querySelector('#show-more-container');
  const btnShowMore = container.querySelector('#btn-show-more');

  const INITIAL_LIMIT = 15;
  let showAll = sortedSymptomCodes.length <= INITIAL_LIMIT;

  const renderChecklist = () => {
    const visibleCodes = showAll ? sortedSymptomCodes : sortedSymptomCodes.slice(0, INITIAL_LIMIT);
    
    form.innerHTML = visibleCodes.map(code => {
      const isChecked = activeChecked.has(code);
      const isAnchor = anchors.includes(code);
      const labelText = symptomsMasterRes[code] || code;

      return `
        <label class="gejala-option">
          <input type="checkbox" name="gejala" value="${code}" class="gejala-input"
            ${isChecked ? 'checked' : ''} data-anchor="${isAnchor}">
          <span class="gejala-box">${labelText} ${isAnchor ? '<strong>(Keluhan Anda)</strong>' : ''}</span>
        </label>
      `;
    }).join('');

    // Update show more button
    if (!showAll && sortedSymptomCodes.length > INITIAL_LIMIT) {
      const remainingCount = sortedSymptomCodes.length - INITIAL_LIMIT;
      btnShowMore.textContent = `Tampilkan semua gejala lainnya (+${remainingCount})`;
      showMoreContainer.classList.remove('hidden');
    } else {
      showMoreContainer.classList.add('hidden');
    }

    validateSelection();
  };

  const validateSelection = () => {
    const checkedCheckboxes = form.querySelectorAll('input[name="gejala"]:checked');
    btnDiagnose.disabled = checkedCheckboxes.length === 0;
  };

  // Keep track of check state even if list expands
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
    // Save selected symptoms to state
    const selectedGejalaCodes = Array.from(activeChecked);
    updateState({ selectedGejalaCodes });

    navigateTo('#/proses');
  });

  btnBack.addEventListener('click', () => {
    navigateTo('#/pilih-keluhan');
  });

  // Initial render
  renderChecklist();
}
