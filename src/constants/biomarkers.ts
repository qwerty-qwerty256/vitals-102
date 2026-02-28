// Biomarker categories
export const BIOMARKER_CATEGORIES = {
  DIABETES: 'diabetes',
  KIDNEY: 'kidney',
  LIVER: 'liver',
  LIPID: 'lipid',
  THYROID: 'thyroid',
  BLOOD_COUNT: 'blood_count',
  VITAMINS: 'vitamins',
  HORMONES: 'hormones',
  OTHER: 'other',
} as const;

export type BiomarkerCategory = typeof BIOMARKER_CATEGORIES[keyof typeof BIOMARKER_CATEGORIES];

// Common biomarker aliases (to be expanded)
export const BIOMARKER_ALIASES: Record<string, string> = {
  // Diabetes
  'fbs': 'fasting_blood_sugar',
  'fasting glucose': 'fasting_blood_sugar',
  'glucose fasting': 'fasting_blood_sugar',
  'hba1c': 'hemoglobin_a1c',
  'glycated hemoglobin': 'hemoglobin_a1c',
  
  // Lipid panel
  'total cholesterol': 'cholesterol_total',
  'ldl': 'ldl_cholesterol',
  'ldl-c': 'ldl_cholesterol',
  'hdl': 'hdl_cholesterol',
  'hdl-c': 'hdl_cholesterol',
  'triglycerides': 'triglycerides',
  'tg': 'triglycerides',
  
  // Kidney
  'creatinine': 'creatinine',
  'bun': 'blood_urea_nitrogen',
  'urea': 'blood_urea_nitrogen',
  'egfr': 'egfr',
  
  // Liver
  'alt': 'alt',
  'sgpt': 'alt',
  'ast': 'ast',
  'sgot': 'ast',
  'alp': 'alkaline_phosphatase',
  'alkaline phosphatase': 'alkaline_phosphatase',
  
  // Thyroid
  'tsh': 'tsh',
  't3': 't3',
  't4': 't4',
  'free t3': 'free_t3',
  'free t4': 'free_t4',
  
  // Blood count
  'hemoglobin': 'hemoglobin',
  'hb': 'hemoglobin',
  'hgb': 'hemoglobin',
  'wbc': 'white_blood_cells',
  'rbc': 'red_blood_cells',
  'platelet': 'platelets',
  'plt': 'platelets',
};
