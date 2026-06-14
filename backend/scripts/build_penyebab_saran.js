const fs = require('fs');
const path = require('path');

const projectDir = 'd:\\PROJEK\\matic-care';

// Load rules
const rules = JSON.parse(fs.readFileSync(path.join(projectDir, 'data', 'rules.json'), 'utf-8'));

// Find unique damages and associate them with their raw category and symptoms
const uniqueDamages = {};
rules.forEach(rule => {
  const name = rule.kerusakan;
  if (!uniqueDamages[name]) {
    uniqueDamages[name] = {
      nama: name,
      bagian: rule.bagian.toUpperCase(),
      gejala_names: new Set(),
      gejala_codes: new Set()
    };
  }
  rule.gejala_names.forEach(g => uniqueDamages[name].gejala_names.add(g));
  rule.gejala_codes.forEach(g => uniqueDamages[name].gejala_codes.add(g));
});

console.log(`Found ${Object.keys(uniqueDamages).length} unique damages in rules.`);

const result = {};

// Helper to determine the system ID based on raw category
function getSystem(bagian) {
  const b = bagian.toUpperCase();
  if (b.includes('CVT')) return 'cvt';
  if (b.includes('MESIN') || b.includes('ENGINE') || b.includes('PELUMASAN')) return 'mesin';
  if (b.includes('PENGAPIAN') || b.includes('SENSOR')) return 'pengapian_sensor';
  if (b.includes('KELISTRIKAN') || b.includes('ELECTRICAL') || b.includes('LAMPU')) return 'kelistrikan';
  if (b.includes('PENDINGINAN')) return 'pendinginan';
  if (b.includes('BAHAN') || b.includes('FUEL') || b.includes('INJEKSI') || b.includes('SYSTEM') || b.includes('SISTEM')) return 'bahan_bakar';
  if (b.includes('REM')) return 'rem';
  if (b.includes('KNALPOT') || b.includes('EXHAUST')) return 'knalpot';
  return 'bodi_kaki';
}

Object.values(uniqueDamages).forEach(damage => {
  const system = getSystem(damage.bagian);
  const name = damage.nama;
  const nameLower = name.toLowerCase();
  
  // Extract a few symptoms to ground our text
  const symptomsArray = Array.from(damage.gejala_names);
  const primarySymptom = symptomsArray[0] || "gejala tidak normal";
  const secondarySymptom = symptomsArray[1] || symptomsArray[0] || "gangguan performa";
  
  let penyebab = [];
  let saran = [];
  
  // Rule-based generation based on system and keywords
  if (system === 'cvt') {
    if (nameLower.includes('roller')) {
      penyebab = [
        "Masa pakai roller CVT sudah melewati batas (umumnya 8.000–12.000 km).",
        "Gaya berkendara agresif (sering menghentak gas secara mendadak).",
        "Roller peyang atau aus tidak rata sehingga tidak bisa berputar mulus."
      ];
      saran = [
        { teks: "Buka bak CVT dan lakukan pembersihan debu sisa gesekan.", level: "bisa_dipantau" },
        { teks: "Periksa kebulatan roller dan ganti satu set roller jika ada yang peyang.", level: "segera_diperiksa" },
        { teks: "Gunakan suku cadang orisinal untuk mencegah keausan dini.", level: "bisa_dipantau" }
      ];
    } else if (nameLower.includes('v-belt') || nameLower.includes('vanbelt') || nameLower.includes('belt')) {
      penyebab = [
        "Usia pakai v-belt sudah tinggi (umumnya harus diganti setiap 20.000–24.000 km).",
        "Suhu panas berlebih di dalam mangkok CVT akibat kurang ventilasi.",
        "Terkena ceceran oli akibat kebocoran seal kruk as."
      ];
      saran = [
        { teks: "Periksa keretakan di sela-sela gigi v-belt secara berkala.", level: "bisa_dipantau" },
        { teks: "Segera ganti v-belt baru jika sudah mulai retak atau menipis agar tidak putus di jalan.", level: "segera_diperiksa" },
        { teks: "Jika v-belt putus total, segera derek motor ke bengkel terdekat.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('kampas ganda') || nameLower.includes('kampas sentrifugal') || nameLower.includes('clutch')) {
      penyebab = [
        "Kampas ganda sudah tipis atau aus karena masa pakai.",
        "Permukaan kampas ganda licin (glazing) akibat kotoran, debu, atau ceceran gemuk CVT.",
        "Sering menahan tuas rem belakang sambil membuka gas (membuat kampas bergesekan terus)."
      ];
      saran = [
        { teks: "Bersihkan area mangkok kopling ganda dari debu dan kotoran.", level: "bisa_dipantau" },
        { teks: "Amplas permukaan kampas ganda yang licin agar kembali menggigit mangkok.", level: "segera_diperiksa" },
        { teks: "Ganti kampas ganda jika ketebalannya sudah di bawah 1 mm.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('bearing') || nameLower.includes('gearbox') || nameLower.includes('gigi')) {
      penyebab = [
        "Bearing atau gigi rasio di gearbox aus akibat gesekan tinggi.",
        "Oli gardan (transmisi) jarang diganti atau kemasukan air saat banjir.",
        "Beban kerja transmisi belakang yang berlebihan."
      ];
      saran = [
        { teks: "Cek kondisi oli gardan, pastikan tidak berwarna putih susu (tercampur air).", level: "bisa_dipantau" },
        { teks: "Ganti oli gardan secara rutin setiap 8.000 km.", level: "bisa_dipantau" },
        { teks: "Segera bawa ke bengkel untuk mengganti bearing gearbox sebelum merusak gigi rasio.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('per cvt') || nameLower.includes('spring')) {
      penyebab = [
        "Per CVT (per kopling/slider) melemah karena faktor umur dan panas.",
        "Modifikasi per CVT yang terlalu keras sehingga mempercepat aus komponen lain.",
        "Beban kerja transmisi saat menanjak yang konstan."
      ];
      saran = [
        { teks: "Rasakan respons akselerasi tengah, ganti per jika terasa lelet.", level: "bisa_dipantau" },
        { teks: "Ganti per CVT dengan spesifikasi standar pabrikan agar awet.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('seal') || nameLower.includes('bocor') || nameLower.includes('oil seal')) {
      penyebab = [
        "Seal karet di kruk as atau pulley belakang pecah/getas karena umur.",
        "Tekanan oli berlebih di mesin atau bak transmisi.",
        "Kotoran pasir/debu menyelinap di bibir seal."
      ];
      saran = [
        { teks: "Bersihkan sisa rembesan oli di dalam bak CVT.", level: "bisa_dipantau" },
        { teks: "Segera ganti seal karet yang bocor sebelum oli melumuri v-belt dan memicu slip parah.", level: "segera_diperiksa" }
      ];
    } else {
      penyebab = [
        "Adanya keausan fisik pada komponen mekanis internal CVT.",
        "Kotoran debu hitam yang menumpuk di mangkok kopling dan rumah roller.",
        `Menyebabkan keluhan seperti "${primarySymptom}" atau "${secondarySymptom}".`
      ];
      saran = [
        { teks: "Lakukan servis CVT berkala di bengkel resmi/kepercayaan.", level: "bisa_dipantau" },
        { teks: "Bersihkan debu-debu hitam dan lumasi pin guide pulley dengan gemuk khusus CVT.", level: "segera_diperiksa" }
      ];
    }
  } else if (system === 'mesin') {
    if (nameLower.includes('oli') || nameLower.includes('pelumasan')) {
      penyebab = [
        "Volume oli mesin berkurang drastis (menguap) atau bocor.",
        "Oli mesin kotor dan sudah kehilangan daya lumasnya akibat telat ganti.",
        "Pompa oli mesin bermasalah sehingga sirkulasi oli tidak lancar."
      ];
      saran = [
        { teks: "Cek stik oli mesin (dipstick) untuk memastikan volumenya cukup.", level: "bisa_dipantau" },
        { teks: "Ganti oli mesin secara rutin setiap 2.000–3.000 km.", level: "segera_diperiksa" },
        { teks: "Jika oli mesin kering sama sekali, segera matikan mesin dan bawa ke bengkel untuk cegah piston macet.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('klep') || nameLower.includes('valve') || nameLower.includes('tappet')) {
      penyebab = [
        "Setelan celah klep terlalu longgar atau terlalu rapat.",
        "Daun klep bocor/kotor akibat tumpukan karbon sisa pembakaran.",
        "Rantai keteng (timing chain) kendor sehingga timing buka-tutup klep bergeser."
      ];
      saran = [
        { teks: "Dengarkan suara mesin, jika berisik berdetik halus, setelan klep mungkin longgar.", level: "bisa_dipantau" },
        { teks: "Lakukan penyetelan celah klep sesuai spesifikasi pabrikan.", level: "segera_diperiksa" },
        { teks: "Bawa ke bengkel untuk skir klep jika kompresi bocor akibat klep tidak rapat.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('kompresi') || nameLower.includes('piston') || nameLower.includes('ring piston') || nameLower.includes('gasket')) {
      penyebab = [
        "Ring piston aus atau macet karena kerak karbon.",
        "Dinding silinder baret akibat gesekan kering tanpa oli.",
        "Gasket/paking kepala silinder bocor atau sobek."
      ];
      saran = [
        { teks: "Lakukan tes kompresi mesin di bengkel.", level: "segera_diperiksa" },
        { teks: "Bila keluar asap putih tebal dari knalpot, segera ganti ring piston dan korter silinder.", level: "segera_bengkel" },
        { teks: "Segera bongkar dan ganti paking silinder jika terdeteksi kebocoran kompresi.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('overheat') || nameLower.includes('panas')) {
      penyebab = [
        "Suhu pembakaran tidak terkontrol akibat minimnya pelumasan/pendinginan.",
        "Beban mesin berlebih atau macet berkepanjangan.",
        "Adanya kebocoran kompresi yang merambat ke area pendingin."
      ];
      saran = [
        { teks: "Pinggirkan motor dan matikan mesin segera jika indikator suhu menyala merah.", level: "segera_bengkel" },
        { teks: "Biarkan mesin dingin sebelum memeriksa volume cairan radiator.", level: "segera_diperiksa" }
      ];
    } else {
      penyebab = [
        "Keausan pada komponen bergerak di dalam mesin (cylinder block, piston, kruk as).",
        "Penumpukan kerak karbon di ruang bakar yang mengganggu efisiensi.",
        `Terjadi gangguan pada siklus kerja mesin, ditandai dengan "${primarySymptom}".`
      ];
      saran = [
        { teks: "Periksa kualitas dan kuantitas oli mesin Anda.", level: "bisa_dipantau" },
        { teks: "Lakukan tune-up mesin rutin untuk membersihkan ruang bakar.", level: "segera_diperiksa" },
        { teks: "Jika terdengar ketukan keras (knocking) dari mesin, segera periksakan ke bengkel.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'kelistrikan') {
    if (nameLower.includes('aki') || nameLower.includes('baterai') || nameLower.includes('battery')) {
      penyebab = [
        "Aki sudah soak/rusak karena usia pakai (biasanya 1,5–3 tahun).",
        "Adanya korsleting arus listrik (kabel terkelupas/kotor) yang menguras daya aki.",
        "Sistem pengisian aki dari spul/kiprok tidak berfungsi normal."
      ];
      saran = [
        { teks: "Ukur tegangan aki menggunakan voltmeter, pastikan di atas 12,4 Volt saat mesin mati.", level: "bisa_dipantau" },
        { teks: "Cas ulang aki jika kosong, atau ganti baru jika sudah soak tidak bisa menyimpan daya.", level: "segera_diperiksa" },
        { teks: "Periksa kabel terminal aki dari jamur atau karat putih, bersihkan dengan air hangat.", level: "bisa_dipantau" }
      ];
    } else if (nameLower.includes('kiprok') || nameLower.includes('regulator') || nameLower.includes('voltage')) {
      penyebab = [
        "Kiprok (regulator tegangan) rusak atau terbakar karena kepanasan.",
        "Dioda penyearah di dalam kiprok putus sehingga arus tidak terregulasi.",
        "Konektor kiprok longgar atau berkarat."
      ];
      saran = [
        { teks: "Ukur tegangan pengisian aki saat mesin hidup, jika di atas 15V (overcharge) kiprok wajib diganti.", level: "segera_diperiksa" },
        { teks: "Ganti kiprok yang rusak sebelum tegangan berlebih membakar lampu dan merusak aki.", level: "segera_diperiksa" },
        { teks: "Gunakan kiprok asli bawaan motor agar pengisian stabil.", level: "bisa_dipantau" }
      ];
    } else if (nameLower.includes('spul') || nameLower.includes('alternator')) {
      penyebab = [
        "Kumparan tembaga spul terbakar (korsleting) akibat panas mesin.",
        "Spul kotor terkena rembesan oli mesin.",
        "Magnet spul melemah atau tergores."
      ];
      saran = [
        { teks: "Bawa ke bengkel untuk mengukur tahanan (hambatan) kumparan spul.", level: "segera_diperiksa" },
        { teks: "Ganti spul yang terbakar agar pengisian aki dan kelistrikan motor kembali normal.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('lampu') || nameLower.includes('sein') || nameLower.includes('headlamp')) {
      penyebab = [
        "Filamen bohlam lampu putus karena getaran atau tegangan tidak stabil.",
        "Wiring/kabel lampu korsleting atau fiting lampu gosong.",
        "Relay atau flasher sein rusak sehingga sein tidak bisa berkedip."
      ];
      saran = [
        { teks: "Periksa kondisi bohlam lampu secara fisik.", level: "bisa_dipantau" },
        { teks: "Ganti bohlam atau kabel yang rusak secara mandiri atau di bengkel terdekat.", level: "segera_diperiksa" },
        { teks: "Jika lampu rem mati total, segera perbaiki karena membahayakan pengendara di belakang.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('fuse') || nameLower.includes('sekring')) {
      penyebab = [
        "Sekring putus akibat lonjakan arus atau korsleting listrik.",
        "Kaki-kaki sekring longgar atau berkarat.",
        "Pemasangan sekring dengan ampere yang tidak sesuai standar."
      ];
      saran = [
        { teks: "Buka kotak sekring dan ganti sekring yang putus dengan cadangan berukuran sama.", level: "bisa_dipantau" },
        { teks: "Jangan memaksakan menggunakan sekring ber-ampere lebih besar karena berisiko kebakaran kabel.", level: "segera_diperiksa" },
        { teks: "Jika sekring terus-menerus putus, segera periksakan instalasi kabel ke bengkel untuk cari titik korsleting.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Adanya kabel kelistrikan yang terkelupas, longgar, atau korosi.",
        "Kegagalan sistem kontrol tegangan di motor matic.",
        `Menyebabkan gangguan komponen listrik seperti "${primarySymptom}".`
      ];
      saran = [
        { teks: "Periksa sambungan kabel massa di rangka motor, pastikan kencang.", level: "bisa_dipantau" },
        { teks: "Ganti kabel-kabel yang sudah mengeras atau retak.", level: "segera_diperiksa" },
        { teks: "Bawa ke bengkel kelistrikan khusus jika sistem keyless / ECU terganggu.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'pengapian_sensor') {
    if (nameLower.includes('busi') || nameLower.includes('spark plug')) {
      penyebab = [
        "Busi kotor terlapisi karbon (sisa bensin berlebih) atau oli mesin.",
        "Celah elektroda busi sudah terlalu renggang akibat masa pakai lama.",
        "Busi mengalami penurunan performa / mati total."
      ];
      saran = [
        { teks: "Lepas busi, bersihkan elektrodanya dari jelaga hitam menggunakan sikat kawat.", level: "bisa_dipantau" },
        { teks: "Setel kembali celah busi ke ukuran standar (sekitar 0.7–0.8 mm).", level: "bisa_dipantau" },
        { teks: "Ganti busi baru setiap 8.000–10.000 km demi pengapian yang maksimal.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('koil') || nameLower.includes('ignition coil')) {
      penyebab = [
        "Kumparan primer/sekunder di dalam koil rusak akibat panas berlebih.",
        "Kabel busi atau kop busi bocor (arus listrik melompat ke rangka).",
        "Konektor kabel koil dari ECU/CDI longgar."
      ];
      saran = [
        { teks: "Periksa keretakan fisik pada bodi koil dan kabel busi.", level: "bisa_dipantau" },
        { teks: "Segera ganti koil yang lemah karena membuat mesin brebet parah saat panas.", level: "segera_diperiksa" },
        { teks: "Ganti kop busi jika terdeteksi kebocoran arus ke bodi logam.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('cdi') || nameLower.includes('ecu') || nameLower.includes('saklar')) {
      penyebab = [
        "Modul pengapian (CDI/ECU) rusak, error, atau terbakar.",
        "Konektor pin CDI/ECU berkarat atau kemasukan air.",
        "Saklar kunci kontak rusak/kotor sehingga memutuskan arus pengapian."
      ];
      saran = [
        { teks: "Periksa kebersihan konektor CDI/ECU dan bersihkan dengan contact cleaner.", level: "bisa_dipantau" },
        { teks: "Jangan mencoba memodifikasi kabel ECU secara asal-asalan.", level: "segera_diperiksa" },
        { teks: "Ganti CDI/ECU yang terbukti mati total di bengkel resmi agar sistem injeksi aman.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('tps') || nameLower.includes('map') || nameLower.includes('ckp') || nameLower.includes('sensor') || nameLower.includes('isc')) {
      penyebab = [
        "Sensor injeksi (TPS, CKP, O2, MAP, atau ISC) kotor oleh debu atau kerak oli.",
        "Kabel sensor injeksi putus digigit tikus atau tergesek rangka.",
        "Kerusakan internal sensor sehingga mengirimkan data salah ke ECU."
      ];
      saran = [
        { teks: "Bersihkan sensor throttle body menggunakan spray khusus injector cleaner.", level: "segera_diperiksa" },
        { teks: "Lakukan reset ECU menggunakan scanner OBD di bengkel terdekat.", level: "segera_diperiksa" },
        { teks: "Segera bawa ke bengkel injeksi jika motor mendadak mogok akibat sensor CKP mati.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Kegagalan sistem pengapian atau sensor elektronik yang mengatur pembakaran.",
        "Kualitas kabel busi yang memburuk sehingga menghambat aliran listrik tegangan tinggi.",
        `Mengganggu pengapian yang memicu keluhan seperti "${primarySymptom}".`
      ];
      saran = [
        { teks: "Periksa sambungan kabel busi dan kop busi.", level: "bisa_dipantau" },
        { teks: "Segera ganti busi jika pengapian terlihat merah/kecil.", level: "segera_diperiksa" },
        { teks: "Jika motor mogok total tanpa percikan api sama sekali, bawa ke bengkel pengapian.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'pendinginan') {
    if (nameLower.includes('radiator bocor') || nameLower.includes('selang radiator') || nameLower.includes('coolant leak')) {
      penyebab = [
        "Radiator bocor akibat terkena pentalan kerikil di jalan.",
        "Selang karet radiator getas/retak karena umur dan tekanan air panas.",
        "Klem selang radiator longgar sehingga cairan pendingin merembes."
      ];
      saran = [
        { teks: "Periksa rembesan cairan pendingin di bawah motor saat parkir.", level: "bisa_dipantau" },
        { teks: "Kencangkan klem selang radiator yang longgar.", level: "bisa_dipantau" },
        { teks: "Bawa ke bengkel untuk menambal radiator atau mengganti selang agar coolant tidak habis yang memicu overheat.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('thermostat') || nameLower.includes('termostat')) {
      penyebab = [
        "Thermostat macet dalam kondisi tertutup karena korosi atau kerak air.",
        "Pegas thermostat lemah sehingga tidak membuka pada suhu kerja mesin.",
        "Penggunaan air mineral biasa yang memicu karat di dalam thermostat."
      ];
      saran = [
        { teks: "Jangan menggunakan air keran biasa, selalu gunakan air khusus radiator (coolant).", level: "bisa_dipantau" },
        { teks: "Ganti thermostat jika suhu mesin tetap sangat tinggi padahal kipas menyala.", level: "segera_diperiksa" },
        { teks: "Jika thermostat macet tertutup total, mesin bisa jebol karena overheat; segera bawa ke bengkel.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('kipas') || nameLower.includes('fan') || nameLower.includes('resistor')) {
      penyebab = [
        "Motor kipas radiator mati/terbakar.",
        "Sensor suhu air pendingin (ECT) rusak sehingga tidak memerintahkan kipas berputar.",
        "Sekring kipas radiator putus atau kabelnya digigit tikus."
      ];
      saran = [
        { teks: "Periksa sekring radiator di kotak sekring.", level: "bisa_dipantau" },
        { teks: "Periksa apakah kipas bisa diputar dengan tangan saat mesin mati (pastikan tidak macet).", level: "bisa_dipantau" },
        { teks: "Ganti kipas radiator yang mati segera ke bengkel agar mesin tidak overheat saat macet.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Kurangnya volume cairan pendingin (coolant) di tangki cadangan (reservoir).",
        "Sumbatan kotoran/karat di dalam kisi-kisi radiator.",
        `Gangguan sirkulasi air pendingin, ditandai dengan "${primarySymptom}".`
      ];
      saran = [
        { teks: "Cek tabung reservoir radiator, tambahkan coolant jika di bawah garis MIN.", level: "bisa_dipantau" },
        { teks: "Kuras dan bersihkan sistem radiator secara berkala setiap 12.000 km.", level: "segera_diperiksa" },
        { teks: "Jika indikator suhu merah menyala, segera matikan mesin dan pinggirkan motor ke bengkel terdekat.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'bahan_bakar') {
    if (nameLower.includes('karburator')) {
      penyebab = [
        "Pilot jet atau main jet karburator tersumbat kotoran/endapan bensin.",
        "Setelan sekrup udara (air screw) karburator kurang pas.",
        "Karet vakum karburator sobek atau mengeras."
      ];
      saran = [
        { teks: "Bersihkan mangkok karburator dari air atau endapan debu.", level: "bisa_dipantau" },
        { teks: "Bongkar dan bersihkan spuyer (jet) karburator menggunakan karbu cleaner.", level: "segera_diperiksa" },
        { teks: "Ganti karet vakum jika robek agar respons gas kembali normal.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('injector') || nameLower.includes('injektor')) {
      penyebab = [
        "Lubang (hole) injektor tersumbat oleh kerak karbon sisa bahan bakar.",
        "Kualitas bahan bakar buruk (bensin kotor/oktan terlalu rendah).",
        "Konektor kabel injektor longgar atau bermasalah."
      ];
      saran = [
        { teks: "Gunakan bensin beroktan tinggi dan hindari membeli bensin eceran.", level: "bisa_dipantau" },
        { teks: "Campurkan injector cleaner ke dalam tangki bensin untuk pembersihan ringan.", level: "bisa_dipantau" },
        { teks: "Bawa ke bengkel untuk membersihkan injektor dengan alat pembersih ultrasonik.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('fuel pump') || nameLower.includes('pompa')) {
      penyebab = [
        "Dinamo fuel pump (rotak) melemah sehingga tekanan bensin turun.",
        "Filter bensin di dalam tangki tersumbat kotoran pekat.",
        "Relay fuel pump rusak membuat pompa tidak bekerja."
      ];
      saran = [
        { teks: "Dengarkan suara dengungan pompa di dalam tangki saat kunci kontak diputar ke ON.", level: "bisa_dipantau" },
        { teks: "Ganti saringan/filter bensin yang hitam pekat agar aliran bensin lancar.", level: "segera_diperiksa" },
        { teks: "Jika terdeteksi kebocoran bensin di area selang injeksi, matikan mesin dan segera ke bengkel demi cegah kebakaran.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('bensin') || nameLower.includes('fuel quality') || nameLower.includes('bahan bakar')) {
      penyebab = [
        "Penggunaan bensin oktan rendah yang memicu detonasi/knocking.",
        "Bahan bakar tercampur air (akibat banjir atau air hujan masuk tangki).",
        "Tangki bensin kotor dan berkarat di bagian dasar."
      ];
      saran = [
        { teks: "Kuras tangki bensin jika motor mogok setelah mencuci atau melewati genangan banjir.", level: "segera_diperiksa" },
        { teks: "Gunakan bensin yang sesuai rasio kompresi motor (Pertalite / Pertamax).", level: "bisa_dipantau" },
        { teks: "Jika air masuk ke ruang bakar (water hammer), segera bawa ke bengkel tanpa menghidupkan mesin.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Aliran bahan bakar terganggu akibat filter kotor atau udara palsu (kebocoran vakum).",
        "Setelan debit bensin yang terlalu miskin atau terlalu kaya.",
        `Menyebabkan motor terasa "${primarySymptom}" atau brebet.`
      ];
      saran = [
        { teks: "Periksa kebersihan saringan udara motor.", level: "bisa_dipantau" },
        { teks: "Lakukan servis injeksi / karburator secara rutin.", level: "segera_diperiksa" },
        { teks: "Jika tercium bau bensin menyengat akibat kebocoran tangki/selang, segera perbaiki ke bengkel.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'rem') {
    // Crucial safety rules -> force segera_bengkel for key points
    if (nameLower.includes('blong')) {
      penyebab = [
        "Minyak rem mendidih (vapor lock) akibat pengereman terus-menerus di jalan menurun.",
        "Kebocoran parah pada seal piston kaliper atau seal master rem.",
        "Kampas rem sudah habis/tipis hingga besi bergesekan dengan besi."
      ];
      saran = [
        { teks: "Segera pinggirkan motor dan hentikan penggunaan sebelum terjadi kecelakaan.", level: "segera_bengkel" },
        { teks: "Lakukan pemeriksaan kebocoran minyak rem di kaliper dan master rem.", level: "segera_bengkel" },
        { teks: "Ganti minyak rem dan lakukan bleeding untuk membuang angin palsu.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('kampas rem aus') || nameLower.includes('kampas') || nameLower.includes('tromol')) {
      penyebab = [
        "Ketebalan kampas rem sudah di bawah batas minimum (kurang dari 1 mm).",
        "Kampas rem kotor terkena lumpur, oli, atau cairan berminyak.",
        "Tromol rem belakang aus atau bergelombang."
      ];
      saran = [
        { teks: "Periksa ketebalan kampas rem secara visual dari celah kaliper/tromol.", level: "bisa_dipantau" },
        { teks: "Segera ganti kampas rem yang sudah aus agar tidak merusak cakram/tromol.", level: "segera_diperiksa" },
        { teks: "Jika rem terasa sangat tidak pakem dan berbunyi logam bergesekan, segera ke bengkel.", level: "segera_bengkel" }
      ];
    } else if (nameLower.includes('bocor') || nameLower.includes('seal') || nameLower.includes('minyak rem')) {
      penyebab = [
        "Karet seal piston kaliper atau seal master rem sobek karena usia pakai.",
        "Selang rem retak atau pecah akibat benturan.",
        "Cairan/minyak rem menyusut akibat rembesan halus di sambungan baut."
      ];
      saran = [
        { teks: "Periksa tanda rembesan minyak rem di stang atau di roda dekat kaliper.", level: "bisa_dipantau" },
        { teks: "Tambahkan minyak rem jika berkurang, pastikan menggunakan spek yang sesuai (DOT 3/4).", level: "segera_diperiksa" },
        { teks: "Ganti seal rem yang bocor di bengkel agar rem tidak mendadak blong.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Adanya gelembung udara terjebak di dalam saluran minyak rem (masuk angin).",
        "Piston kaliper macet akibat tumpukan karat atau debu tanah.",
        `Mengurangi efektivitas cengkeraman rem, memicu keluhan seperti "${primarySymptom}".`
      ];
      saran = [
        { teks: "Lakukan pembersihan kaliper dan lumasi pin kaliper rem.", level: "bisa_dipantau" },
        { teks: "Kuras minyak rem dan lakukan bleeding udara jika rem terasa empuk/membal.", level: "segera_diperiksa" },
        { teks: "Demi keselamatan, segera bawa ke bengkel untuk pemeriksaan menyeluruh sistem rem.", level: "segera_bengkel" }
      ];
    }
  } else if (system === 'knalpot') {
    penyebab = [
      "Knalpot tersumbat oleh tumpukan karbon sisa pembakaran yang tebal.",
      "Knalpot keropos atau bocor di bagian leher knalpot akibat karat.",
      "Catalytic converter rusak sehingga menghambat aliran gas buang."
    ];
    saran = [
      { teks: "Periksa fisik knalpot, pastikan tidak ada kebocoran udara di sambungan leher knalpot.", level: "bisa_dipantau" },
      { teks: "Bersihkan atau lakukan bedah knalpot jika motor terasa tertahan akibat mampet.", level: "segera_diperiksa" },
      { teks: "Jika asap knalpot berbau menyengat atau berasap putih tebal, segera bawa ke bengkel mesin.", level: "segera_bengkel" }
    ];
  } else {
    // Bodi, Rangka & Kaki-kaki
    if (nameLower.includes('ban') || nameLower.includes('velg')) {
      penyebab = [
        "Tekanan angin ban kurang atau berlebih.",
        "Ban sudah botak atau mengalami keausan tidak merata (bergelombang).",
        "Velg peyang atau bearing roda depan/belakang aus (oblak)."
      ];
      saran = [
        { teks: "Periksa dan sesuaikan tekanan angin ban sesuai standar (biasanya depan 29 psi, belakang 33 psi).", level: "bisa_dipantau" },
        { teks: "Ganti ban jika kembangannya sudah menyentuh batas TWI (indikator keausan).", level: "segera_diperiksa" },
        { teks: "Ganti bearing roda yang oblak di bengkel agar motor stabil di kecepatan tinggi.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('suspensi') || nameLower.includes('shock') || nameLower.includes('bushing')) {
      penyebab = [
        "Oli shockbreaker bocor sehingga kehilangan redaman rebond.",
        "Bushing karet suspensi atau engine mounting aus/pecah.",
        "As shockbreaker baret akibat kotoran pasir."
      ];
      saran = [
        { teks: "Bersihkan as shockbreaker dari debu jalanan agar tidak merusak seal karet.", level: "bisa_dipantau" },
        { teks: "Lakukan penggantian seal dan oli shock jika terasa jedug saat lewat polisi tidur.", level: "segera_diperiksa" }
      ];
    } else if (nameLower.includes('rangka') || nameLower.includes('bodi') || nameLower.includes('kemudi') || nameLower.includes('setang')) {
      penyebab = [
        "Bearing komstir kemudi aus, seret, atau terlalu kencang.",
        "Rangka motor keropos atau mengalami keretakan akibat karat.",
        "Baut dudukan bodi/mesin kendur akibat getaran tinggi."
      ];
      saran = [
        { teks: "Periksa kekencangan baut-baut bodi secara berkala.", level: "bisa_dipantau" },
        { teks: "Setel kelonggaran komstir kemudi jika stang terasa berat atau berbelok sendiri.", level: "segera_diperiksa" },
        { teks: "Jika terdeteksi retak/keropos pada rangka utama, segera bawa ke bengkel las khusus demi keselamatan berkendara.", level: "segera_bengkel" }
      ];
    } else {
      penyebab = [
        "Keausan pada komponen kaki-kaki atau bagian penyangga beban motor.",
        "Kendurnya sekrup/klip pengikat panel bodi plastik.",
        `Menyebabkan ketidaknyamanan seperti "${primarySymptom}".`
      ];
      saran = [
        { teks: "Lakukan pemeriksaan fisik kaki-kaki secara manual (goyang roda kiri-kanan).", level: "bisa_dipantau" },
        { teks: "Periksa dan kencangkan panel bodi yang longgar.", level: "bisa_dipantau" }
      ];
    }
  }

  // Ensure causes (penyebab) has 2-4 points and suggestions (saran) has 2-3 points
  penyebab = penyebab.slice(0, 4);
  saran = saran.slice(0, 3);
  
  result[name] = {
    penyebab: penyebab,
    saran: saran,
    reviewed: false
  };
});

// Write to file
const outputFilePath = path.join(projectDir, 'data', 'penyebab_saran.json');
fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`Generated ${Object.keys(result).length} entries in ${outputFilePath}`);
