import { getState } from './lib/state.js';

// Route map
const routes = {
  '/': () => import('./views/beranda.js').then(m => m.render),
  '/pilih-sistem': () => import('./views/pilih-sistem.js').then(m => m.render),
  '/pilih-keluhan': () => import('./views/pilih-keluhan.js').then(m => m.render),
  '/pilih-gejala': () => import('./views/pilih-gejala.js').then(m => m.render),
  '/proses': () => import('./views/proses.js').then(m => m.render),
  '/hasil': () => import('./views/hasil-diagnosa.js').then(m => m.render)
};

// Map routes to progress indicator steps (1-5)
const stepMap = {
  '/pilih-sistem': 1,
  '/pilih-keluhan': 2,
  '/pilih-gejala': 3,
  '/proses': 4,
  '/hasil': 5
};

export function updateProgressBar(path) {
  const progressContainer = document.getElementById('progress-container');
  if (!progressContainer) return;

  const currentStep = stepMap[path];
  
  if (!currentStep) {
    progressContainer.classList.add('hidden');
    return;
  }

  progressContainer.classList.remove('hidden');
  
  const stepElements = progressContainer.querySelectorAll('.step');
  const progressBar = progressContainer.querySelector('.progress-bar-fill');
  
  // Update progress bar width
  const percent = ((currentStep - 1) / 4) * 100;
  progressBar.style.width = `${percent}%`;

  stepElements.forEach(el => {
    const stepNum = parseInt(el.getAttribute('data-step'), 10);
    
    // Reset classes
    el.classList.remove('active', 'completed');
    
    if (stepNum === currentStep) {
      el.classList.add('active');
    } else if (stepNum < currentStep) {
      el.classList.add('completed');
    }
  });
}

export async function navigateTo(hash) {
  window.location.hash = hash;
}

export async function handleRouting() {
  const hash = window.location.hash || '#/';
  const path = hash.substring(1) || '/';

  // Navigation guards based on state
  const state = getState();
  
  if (path === '/pilih-keluhan' && !state.selectedCategoryId) {
    navigateTo('#/pilih-sistem');
    return;
  }
  
  if (path === '/pilih-gejala' && (!state.selectedCategoryId || !state.selectedKeluhanId)) {
    navigateTo('#/pilih-sistem');
    return;
  }
  
  if (path === '/proses' && (!state.selectedGejalaCodes || state.selectedGejalaCodes.length === 0)) {
    navigateTo('#/pilih-sistem');
    return;
  }

  if (path === '/hasil' && (!state.selectedGejalaCodes || state.selectedGejalaCodes.length === 0)) {
    navigateTo('#/pilih-sistem');
    return;
  }

  const renderView = routes[path];
  if (renderView) {
    try {
      updateProgressBar(path);
      const appContainer = document.getElementById('app');
      appContainer.innerHTML = '<div class="loading">Memuat Halaman...</div>';
      
      const render = await renderView();
      await render(appContainer);
    } catch (err) {
      console.error('Routing error:', err);
      document.getElementById('app').innerHTML = `
        <div class="error-container">
          <h2>Terjadi Kesalahan</h2>
          <p>Gagal memuat halaman. Silakan coba kembali.</p>
          <button onclick="window.location.hash = '#/'" class="btn btn-primary">Kembali ke Beranda</button>
        </div>
      `;
    }
  } else {
    // 404 - Redirect to home
    navigateTo('#/');
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  // Initial routing
  handleRouting();
}
