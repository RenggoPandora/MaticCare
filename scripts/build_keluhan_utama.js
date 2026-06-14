const fs = require('fs');
const path = require('path');

const projectDir = 'd:\\PROJEK\\matic-care';

// Load data
const rules = JSON.parse(fs.readFileSync(path.join(projectDir, 'data', 'rules.json'), 'utf-8'));
const categories = JSON.parse(fs.readFileSync(path.join(projectDir, 'data', 'kategori_sistem.json'), 'utf-8'));
const symptomsMaster = JSON.parse(fs.readFileSync(path.join(projectDir, 'data', 'gejala_master.json'), 'utf-8'));

// High-quality Indonesian layperson translation map for top symptoms
const laypersonTranslations = {
  // CVT & Transmisi
  "G612": "Motor terasa berat / tarikan kurang responsif saat digas",
  "G639": "Akselerasi motor terasa lambat / lelet",
  "G135": "Motor bergetar tidak normal saat berjalan",
  "G637": "Tarikan motor terasa kurang halus / bergetar (gredek)",
  "G423": "Putaran mesin (RPM) naik turun tidak stabil saat berkendara",
  "G136": "Motor terasa bergetar keras di awal mulai jalan (angkatan awal)",
  "G427": "Putaran mesin tidak stabil / sering naik-turun sendiri",
  "G040": "Tercium bau hangus atau gosong dari area CVT",
  "G154": "Terasa getaran halus berulang saat berkendara",
  "G545": "Terdengar suara tidak wajar dari CVT saat melepas gas (deselerasi)",

  // Mesin & Pelumasan
  "G664": "Tenaga mesin terasa drop atau berkurang",
  "G402": "Performa mesin terasa menurun secara keseluruhan",
  "G306": "Mesin terasa tersendat-sendat atau brebet",
  "G032": "Konsumsi bensin terasa jauh lebih boros dari biasanya",
  "G189": "Mesin terasa kasar saat berhenti (idle / stasioner)",
  "G313": "Suara mesin terdengar kasar dan bising",
  "G337": "Mesin sulit dinyalakan saat pertama kali dihidupkan",
  "G333": "Mesin cepat panas atau terasa gerah di kaki",

  // Kelistrikan & Lampu
  "G284": "Lampu utama atau panel speedometer terasa redup",
  "G643": "Kelistrikan motor melemah (starter/klakson loyo)",
  "G645": "Tegangan listrik naik-turun (lampu berkedip tidak stabil)",
  "G291": "Bohlam lampu motor sering kali putus",
  "G319": "Mesin tiba-tiba mati akibat kelistrikan terputus",
  "G290": "Lampu sein menyala terus tetapi tidak berkedip",
  "G278": "Lampu depan atau lampu panel berkedip-kedip",
  "G270": "Lampu speedometer atau lampu utama berkedip sendiri",

  // Pengapian & Sensor
  "G094": "Lampu indikator mesin (MIL / Check Engine) di dashboard menyala",
  "G064": "Mesin brebet / jalannya tersendat",
  "G659": "Tenaga mesin mendadak hilang sepenuhnya saat jalan",
  "G425": "Indikator RPM mati atau menunjukkan angka nol",
  "G302": "Mesin sering mati sendiri saat sudah panas",

  // Pendinginan
  "G311": "Suhu mesin naik dengan sangat cepat saat digunakan",
  "G378": "Mesin mengalami panas berlebih (overheat)",
  "G332": "Lampu indikator suhu tinggi (merah) menyala di panel dashboard",
  "G404": "Performa mesin drop saat berhenti/stasioner lama",
  "G244": "Kipas radiator berputar sangat sering atau terus-menerus",
  "G052": "Tercium bau sangit/panas dari arah radiator/mesin",
  "G190": "Putaran mesin idle malah meninggi sendiri",

  // Bahan Bakar & Injeksi
  "G635": "Tarikan gas terasa tersendat-sendat / putus-putus",
  "G315": "Mesin terasa ngempos atau kehilangan tenaga saat digas",
  "G323": "Mesin sering mati mendadak saat stasioner (idle)",

  // Rem
  "G166": "Rem terasa bergetar keras saat tuas rem ditekan",
  "G075": "Terdengar suara decitan nyaring saat mengerem",
  "G451": "Respon pengereman terasa lambat atau kurang pakem",
  "G222": "Kampas rem sangat cepat tipis atau aus",
  "G441": "Kemampuan pengereman memudar saat jalan menurun",
  "G440": "Rem terasa blong (ditekan penuh tapi motor tidak berhenti)",
  "G377": "Cairan/minyak rem menyusut drastis",
  "G683": "Tuas rem harus ditarik sangat dalam baru bisa ngerem",

  // Knalpot
  "G586": "Suara letupan knalpot berubah / tidak merata",
  "G542": "Terdengar suara letupan atau desisan bocor dari knalpot",
  "G028": "Knalpot mengeluarkan asap hitam pekat",
  "G596": "Suhu mesin meningkat tidak wajar",

  // Bodi & Kaki-kaki
  "G511": "Motor terasa oleng atau stabilitas berkurang saat jalan",
  "G068": "Terdengar bunyi berisik/kriet-kriet dari bodi atau suspensi",
  "G184": "Kemudi/setang terasa berat atau menarik ke satu sisi",
  "G071": "Bodi motor terasa bergetar keras dan berisik",
  "G118": "Bodi motor renggang, retak, atau tidak presisi",
  "G415": "Komponen bodi/rangka terasa longgar atau hampir lepas",
  "G153": "Getaran mesin merambat kuat ke bodi/rangka",
  "G540": "Rangka terasa tidak kokoh atau oleng saat jalan",
};

const result = [];

categories.forEach(cat => {
  // Get all rules belonging to this category
  const matchingRules = rules.filter(rule => {
    return cat.bagian_terkait.some(bagian => rule.bagian.toUpperCase() === bagian.toUpperCase());
  });

  // Calculate symptom frequencies
  const freq = {};
  matchingRules.forEach(rule => {
    rule.gejala_codes.forEach(code => {
      freq[code] = (freq[code] || 0) + 1;
    });
  });

  // Sort by frequency descending
  const sortedSymptomCodes = Object.entries(freq)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  // Take top 4-8 symptoms (we will take up to 6 to be safe and balanced)
  const topSymptomCodes = sortedSymptomCodes.slice(0, 6);

  topSymptomCodes.forEach((s) => {
    const code = s.code;
    const technicalName = symptomsMaster[code] || code;
    
    // Check if we have a layperson translation, else fallback to PLACEHOLDER
    const labelAwam = laypersonTranslations[code] || `PLACEHOLDER — ${technicalName}`;

    // Get all rule IDs in this category that contain this symptom
    const relatedRuleIds = matchingRules
      .filter(rule => rule.gejala_codes.includes(code))
      .map(rule => rule.id);

    result.push({
      kategori_id: cat.id,
      id: `${cat.id}-${code.toLowerCase()}`,
      label_awam: labelAwam,
      gejala_anchor: [code],
      rule_ids_terkait: relatedRuleIds
    });
  });
});

// Ensure directory exists
const outputFilePath = path.join(projectDir, 'data', 'keluhan_utama.json');
fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`Generated ${result.length} entries in ${outputFilePath}`);
