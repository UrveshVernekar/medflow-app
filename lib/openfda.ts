/**
 * OpenFDA & Clinical Safety Service
 * Integrates with official openFDA REST API (https://api.fda.gov/drug/label.json)
 * to provide real-time drug interaction and allergy cross-reference checks.
 */

export interface DrugSafetyWarning {
  type: "allergy_conflict" | "drug_interaction" | "fda_warning";
  severity: "high" | "critical" | "moderate";
  title: string;
  description: string;
}

export interface DrugSafetyCheckResult {
  hasWarnings: boolean;
  warnings: DrugSafetyWarning[];
}

// Common pharmaceutical cross-reaction families for robust fallback
const DRUG_FAMILIES: Record<string, string[]> = {
  penicillin: ["amoxicillin", "ampicillin", "penicillin", "augmentin", "piperacillin"],
  nsaid: ["aspirin", "ibuprofen", "naproxen", "celecoxib", "diclofenac", "ketorolac"],
  statins: ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
  beta_blockers: ["propranolol", "atenolol", "metoprolol", "carvedilol"],
  ace_inhibitors: ["lisinopril", "enalapril", "ramipril", "benazepril"],
};

/**
 * Checks prescribed medications against patient allergies and co-prescribed drug interactions.
 */
export async function checkDrugSafety(
  medications: string[],
  patientAllergies: { allergen: string; severity?: string }[]
): Promise<DrugSafetyCheckResult> {
  const warnings: DrugSafetyWarning[] = [];

  const cleanMeds = medications
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean);
    
  const cleanAllergies = patientAllergies.map((a) => ({
    allergen: a.allergen.trim().toLowerCase(),
    severity: a.severity || "moderate",
  }));

  // 1. ALLERGY CROSS-CHECK
  for (const med of cleanMeds) {
    for (const allergy of cleanAllergies) {
      const allergen = allergy.allergen;

      // Direct exact or substring match
      const directMatch = med.includes(allergen) || allergen.includes(med);

      // Family cross-reference match (e.g. Patient allergic to Penicillin -> Prescribed Amoxicillin)
      let familyMatch = false;
      for (const familyMembers of Object.values(DRUG_FAMILIES)) {
        if (
          familyMembers.some((f) => allergen.includes(f) || f.includes(allergen)) &&
          familyMembers.some((f) => med.includes(f) || f.includes(med))
        ) {
          familyMatch = true;
          break;
        }
      }

      if (directMatch || familyMatch) {
        warnings.push({
          type: "allergy_conflict",
          severity: allergy.severity === "anaphylactic" || allergy.severity === "severe" ? "critical" : "high",
          title: `Allergy Conflict Detected: ${med.toUpperCase()}`,
          description: `Patient has a documented ${allergy.severity.toUpperCase()} allergy to "${allergy.allergen.toUpperCase()}". Prescribing "${med}" poses a severe risk of adverse reaction.`,
        });
      }
    }
  }

  // 2. DRUG-DRUG INTERACTION CROSS-CHECK
  if (cleanMeds.length > 1) {
    // Check known severe drug pairs
    for (let i = 0; i < cleanMeds.length; i++) {
      for (let j = i + 1; j < cleanMeds.length; j++) {
        const med1 = cleanMeds[i];
        const med2 = cleanMeds[j];

        // ACE Inhibitor + NSAID interaction
        const isAce1 = DRUG_FAMILIES.ace_inhibitors.some((f) => med1.includes(f));
        const isNsaid2 = DRUG_FAMILIES.nsaid.some((f) => med2.includes(f));
        const isAce2 = DRUG_FAMILIES.ace_inhibitors.some((f) => med2.includes(f));
        const isNsaid1 = DRUG_FAMILIES.nsaid.some((f) => med1.includes(f));

        if ((isAce1 && isNsaid2) || (isAce2 && isNsaid1)) {
          warnings.push({
            type: "drug_interaction",
            severity: "high",
            title: `Potential Drug Interaction: ${med1.toUpperCase()} + ${med2.toUpperCase()}`,
            description: `Combining ACE Inhibitors with NSAIDs can cause renal impairment and decrease blood pressure control. Monitor serum creatinine and potassium levels.`,
          });
        }
      }
    }
  }

  // 3. OPENFDA LIVE API LOOKUP
  for (const med of cleanMeds) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(
          med
        )}"+openfda.brand_name:"${encodeURIComponent(med)}"&limit=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const results = data.results?.[0];
        if (results?.boxed_warning) {
          const warningSnippet = Array.isArray(results.boxed_warning)
            ? results.boxed_warning[0]
            : results.boxed_warning;

          warnings.push({
            type: "fda_warning",
            severity: "high",
            title: `FDA Boxed Warning for ${med.toUpperCase()}`,
            description: warningSnippet.slice(0, 220) + "...",
          });
        }
      }
    } catch {
      // Silently fall back to rule-based analysis if OpenFDA API is unreachable
    }
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings,
  };
}
