/**
 * Calculates the diagnostic results based on selected symptoms and rules for the chosen category.
 * 
 * @param {string[]} selectedGejalaCodes - Array of symptom codes selected by the user (e.g. ['G612', 'G422'])
 * @param {Array} rulesForCategory - Array of rules belonging to the selected category
 * @returns {Object} Result object containing top match, alternatives, and all filtered matches
 */
export function diagnose(selectedGejalaCodes, rulesForCategory) {
  const selectedSet = new Set(selectedGejalaCodes);

  const scoredRules = rulesForCategory.map(rule => {
    const ruleCodes = rule.gejala_codes;
    const ruleNames = rule.gejala_names;

    // Calculate matched symptoms
    const matchedCodes = ruleCodes.filter(code => selectedSet.has(code));
    const matchedCount = matchedCodes.length;

    // If no match, we skip score calculation (percentage will be 0)
    if (matchedCount === 0) {
      return null;
    }

    const totalSymptoms = ruleCodes.length;
    const percentage = Math.round((matchedCount / totalSymptoms) * 100);

    // Filter < 30%
    if (percentage < 30) {
      return null;
    }

    // Determine label
    let label = "";
    if (percentage >= 75) {
      label = "Sangat Mungkin";
    } else if (percentage >= 50) {
      label = "Cukup Mungkin";
    } else {
      label = "Mungkin";
    }

    // Gejala cocok and tidak cocok
    const gejala_cocok = [];
    const gejala_tidak_cocok = [];

    for (let i = 0; i < totalSymptoms; i++) {
      const code = ruleCodes[i];
      const name = ruleNames[i];
      if (selectedSet.has(code)) {
        gejala_cocok.push({ code, name });
      } else {
        gejala_tidak_cocok.push({ code, name });
      }
    }

    return {
      ...rule,
      matched: matchedCount,
      percentage: percentage,
      label: label,
      gejala_cocok: gejala_cocok,
      gejala_tidak_cocok: gejala_tidak_cocok
    };
  }).filter(Boolean);

  // Sorting: percentage descending, then matched count descending
  scoredRules.sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return b.matched - a.matched;
  });

  const top = scoredRules[0] || null;
  const alternatif = scoredRules.slice(1, 5); // rank #2 to #5 (max 4)

  return {
    top,
    alternatif,
    allFiltered: scoredRules
  };
}
