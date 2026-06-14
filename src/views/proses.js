import { getState, updateState } from '../lib/state.js';
import { diagnose } from '../lib/diagnose.js';
import { navigateTo } from '../router.js';

/**
 * Renders the diagnostic loading / processing view.
 * @param {HTMLElement} container - The element to render the view into
 */
export async function render(container) {
  container.innerHTML = `
    <div class="proses-container">
      <div class="scanner-ring"></div>
      <div>
        <h2>Menganalisa Gejala...</h2>
        <p class="subtitle">Sistem sedang mencocokkan gejala dengan basis pengetahuan kerusakan.</p>
      </div>

      <div class="diagnose-log" id="log-box">
        <div>> Memulai deteksi sistem pakar...</div>
      </div>
    </div>
  `;

  const logBox = container.querySelector('#log-box');
  const state = getState();

  // Load JSON datasets to run calculation
  const [rulesRes, categoriesRes] = await Promise.all([
    fetch('/data/rules.json').then(r => r.json()),
    fetch('/data/kategori_sistem.json').then(r => r.json())
  ]);

  const categoryDef = categoriesRes.find(c => c.id === state.selectedCategoryId);
  const categoryRules = rulesRes.filter(rule => {
    return categoryDef.bagian_terkait.some(
      bagian => rule.bagian.toUpperCase() === bagian.toUpperCase()
    );
  });

  // Perform forward chaining calculation
  const results = diagnose(state.selectedGejalaCodes, categoryRules);

  // Save results to state
  updateState({ diagnosticResults: results });

  // Terminal animation steps
  const logs = [
    `> Membaca kategori: ${categoryDef.nama}...`,
    `> Gejala dipilih: ${state.selectedGejalaCodes.length} gejala.`,
    `> Memindai ${categoryRules.length} pola kerusakan...`,
    `> Menghitung skor persentase kecocokan...`,
    `> Mengurutkan probabilitas kerusakan...`,
    `> Analisa selesai!`
  ];

  let logIndex = 0;
  
  const addLog = () => {
    if (logIndex < logs.length) {
      const line = document.createElement('div');
      line.textContent = logs[logIndex];
      logBox.appendChild(line);
      logBox.scrollTop = logBox.scrollHeight;
      logIndex++;
      setTimeout(addLog, 150);
    } else {
      // Finished log animation, redirect to results page
      setTimeout(() => {
        navigateTo('#/hasil');
      }, 300);
    }
  };

  // Start animation
  setTimeout(addLog, 100);
}
