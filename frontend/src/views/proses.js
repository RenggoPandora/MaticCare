import { getState, updateState } from '../lib/state.js';
import { navigateTo } from '../router.js';
import { apiClient } from '../api/client.js';

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
        <p class="subtitle">Sistem sedang mencocokkan gejala dengan basis pengetahuan kerusakan pada server.</p>
      </div>

      <div class="diagnose-log" id="log-box">
        <div>> Memulai deteksi sistem pakar...</div>
      </div>
    </div>
  `;

  const logBox = container.querySelector('#log-box');
  const state = getState();

  const addLogEntry = (text) => {
    const line = document.createElement('div');
    line.textContent = text;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  };

  try {
    addLogEntry(`> Menghubungkan ke server API...`);
    
    // Call the backend API
    const results = await apiClient.postDiagnose(state.selectedCategoryId, state.selectedGejalaCodes);

    // Save results to state
    updateState({ diagnosticResults: results });

    // Simulation logs for aesthetic
    const logs = [
      `> Gejala dikirim: ${state.selectedGejalaCodes.length} gejala.`,
      `> Server memproses forward chaining...`,
      `> Menghitung skor persentase kecocokan...`,
      `> Mengurutkan probabilitas kerusakan...`,
      `> Analisa selesai!`
    ];

    let logIndex = 0;
    const animateLogs = () => {
      if (logIndex < logs.length) {
        addLogEntry(logs[logIndex]);
        logIndex++;
        setTimeout(animateLogs, 150);
      } else {
        setTimeout(() => {
          navigateTo('#/hasil');
        }, 300);
      }
    };

    setTimeout(animateLogs, 100);

  } catch (error) {
    addLogEntry(`> ERROR: ${error.message}`);
    setTimeout(() => {
      container.innerHTML = `
        <div class="proses-container">
          <div class="error-state">
            <p>Gagal memproses diagnosa: ${error.message}</p>
            <button class="btn btn-primary" onclick="window.location.hash = '#/pilih-gejala'">Kembali ke Pilih Gejala</button>
          </div>
        </div>
      `;
    }, 500);
  }
}
