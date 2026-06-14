import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');

class DataService {
  constructor() {
    this.gejalaMaster = null;
    this.rules = null;
    this.kategoriSistem = null;
    this.keluhanUtama = null;
    this.penyebabSaran = null;
  }

  loadData() {
    try {
      this.gejalaMaster = JSON.parse(readFileSync(join(DATA_DIR, 'gejala_master.json'), 'utf-8'));
      this.rules = JSON.parse(readFileSync(join(DATA_DIR, 'rules.json'), 'utf-8'));
      this.kategoriSistem = JSON.parse(readFileSync(join(DATA_DIR, 'kategori_sistem.json'), 'utf-8'));
      this.keluhanUtama = JSON.parse(readFileSync(join(DATA_DIR, 'keluhan_utama.json'), 'utf-8'));
      this.penyebabSaran = JSON.parse(readFileSync(join(DATA_DIR, 'penyebab_saran.json'), 'utf-8'));
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      process.exit(1);
    }
  }

  getGejalaMaster() {
    return this.gejalaMaster;
  }

  getRules() {
    return this.rules;
  }

  getKategoriSistem() {
    return this.kategoriSistem;
  }

  getKeluhanUtama() {
    return this.keluhanUtama;
  }

  getPenyebabSaran() {
    return this.penyebabSaran;
  }
}

const dataService = new DataService();
dataService.loadData();

export default dataService;
