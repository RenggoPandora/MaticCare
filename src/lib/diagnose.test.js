import { diagnose } from './diagnose.js';
import assert from 'assert';

console.log('Running unit tests for diagnose.js...\n');

// Mock rules
const mockRules = [
  {
    id: "R01",
    bagian: "CVT",
    kerusakan: "Roller peyang",
    gejala_codes: ["G01", "G02", "G03"],
    gejala_names: ["Gejala 1", "Gejala 2", "Gejala 3"]
  },
  {
    id: "R02",
    bagian: "CVT",
    kerusakan: "V-belt retak",
    gejala_codes: ["G01", "G04", "G05", "G06"],
    gejala_names: ["Gejala 1", "Gejala 4", "Gejala 5", "Gejala 6"]
  },
  {
    id: "R03",
    bagian: "CVT",
    kerusakan: "Kampas aus",
    gejala_codes: ["G01", "G02"],
    gejala_names: ["Gejala 1", "Gejala 2"]
  }
];

try {
  // Test 1: 100% match yields 100% score
  console.log('Test 1: 100% match yields 100% score...');
  const result1 = diagnose(["G01", "G02"], [mockRules[2]]); // rule R03 has G01, G02
  assert.ok(result1.top !== null, 'Should have a top match');
  assert.strictEqual(result1.top.id, 'R03');
  assert.strictEqual(result1.top.percentage, 100);
  assert.strictEqual(result1.top.label, 'Sangat Mungkin');
  assert.strictEqual(result1.top.gejala_cocok.length, 2);
  assert.strictEqual(result1.top.gejala_tidak_cocok.length, 0);
  console.log('✔️ Test 1 passed.');

  // Test 2: < 30% match is filtered out
  console.log('\nTest 2: < 30% match is filtered out...');
  // R02 has 4 symptoms: G01, G04, G05, G06. If user selects G01, match is 1/4 = 25% (< 30%)
  const result2 = diagnose(["G01"], [mockRules[1]]);
  assert.strictEqual(result2.top, null, 'Should filter out R02 as it matches 25%');
  assert.strictEqual(result2.allFiltered.length, 0);
  console.log('✔️ Test 2 passed.');

  // Test 3: Correct ranking order
  console.log('\nTest 3: Correct ranking order...');
  // User selects G01, G02, G04
  // R01 (Roller): has G01, G02 (2/3 = 67% match, label: Cukup Mungkin)
  // R02 (V-belt): has G01, G04 (2/4 = 50% match, label: Cukup Mungkin)
  // R03 (Kampas): has G01, G02 (2/2 = 100% match, label: Sangat Mungkin)
  const result3 = diagnose(["G01", "G02", "G04"], mockRules);
  assert.strictEqual(result3.allFiltered.length, 3);
  assert.strictEqual(result3.top.id, 'R03', 'R03 (100%) should be top');
  assert.strictEqual(result3.alternatif[0].id, 'R01', 'R01 (67%) should be 2nd');
  assert.strictEqual(result3.alternatif[1].id, 'R02', 'R02 (50%) should be 3rd');
  console.log('✔️ Test 3 passed.');

  // Test 4: Tie breaker by matched count descending when percentages are equal
  console.log('\nTest 4: Tie breaker by matched count...');
  // Modify mockRules to have equal percentage but different counts
  const mockRulesForTie = [
    {
      id: "T1",
      bagian: "CVT",
      kerusakan: "Kerusakan 1",
      gejala_codes: ["G01", "G02"], // user selects both -> 2/2 = 100%
      gejala_names: ["G1", "G2"]
    },
    {
      id: "T2",
      bagian: "CVT",
      kerusakan: "Kerusakan 2",
      gejala_codes: ["G01", "G02", "G03", "G04"], // user selects all 4 -> 4/4 = 100%
      gejala_names: ["G1", "G2", "G3", "G4"]
    }
  ];
  const result4 = diagnose(["G01", "G02", "G03", "G04"], mockRulesForTie);
  assert.strictEqual(result4.top.id, 'T2', 'T2 has higher matched count (4 vs 2), should be ranked higher');
  assert.strictEqual(result4.alternatif[0].id, 'T1', 'T1 should be alternative');
  console.log('✔️ Test 4 passed.');

  console.log('\nAll unit tests passed successfully!');
} catch (err) {
  console.error('\n❌ Unit test failed:');
  console.error(err);
  process.exit(1);
}
