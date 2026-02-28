-- Seed biomarker definitions with common biomarkers
-- Categories: diabetes, kidney, liver, lipid, thyroid, blood_count, other

-- Diabetes Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('fasting_blood_sugar', 'Fasting Blood Sugar', 'diabetes', 'mg/dL', 70, 100, 50, 200, 'Blood glucose level after fasting for 8-12 hours'),
('hba1c', 'HbA1c', 'diabetes', '%', 4.0, 5.6, 3.0, 10.0, 'Average blood sugar levels over the past 2-3 months'),
('random_blood_sugar', 'Random Blood Sugar', 'diabetes', 'mg/dL', 70, 140, 50, 300, 'Blood glucose level at any time of day'),
('postprandial_blood_sugar', 'Postprandial Blood Sugar', 'diabetes', 'mg/dL', 70, 140, 50, 250, 'Blood glucose level 2 hours after eating');

-- Kidney Function Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('creatinine', 'Creatinine', 'kidney', 'mg/dL', 0.6, 1.2, 0.3, 5.0, 'Waste product filtered by kidneys'),
('blood_urea_nitrogen', 'Blood Urea Nitrogen (BUN)', 'kidney', 'mg/dL', 7, 20, 3, 100, 'Waste product from protein breakdown'),
('uric_acid', 'Uric Acid', 'kidney', 'mg/dL', 3.5, 7.2, 2.0, 12.0, 'Waste product from purine metabolism'),
('egfr', 'eGFR', 'kidney', 'mL/min/1.73m²', 90, 120, 15, 150, 'Estimated glomerular filtration rate - kidney function indicator'),
('bun_creatinine_ratio', 'BUN/Creatinine Ratio', 'kidney', 'ratio', 10, 20, 5, 40, 'Ratio of BUN to creatinine');

-- Liver Function Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('alt', 'ALT (SGPT)', 'liver', 'U/L', 7, 56, 0, 500, 'Alanine aminotransferase - liver enzyme'),
('ast', 'AST (SGOT)', 'liver', 'U/L', 10, 40, 0, 500, 'Aspartate aminotransferase - liver enzyme'),
('alp', 'Alkaline Phosphatase (ALP)', 'liver', 'U/L', 44, 147, 0, 1000, 'Enzyme related to bile ducts and bones'),
('total_bilirubin', 'Total Bilirubin', 'liver', 'mg/dL', 0.1, 1.2, 0, 20, 'Waste product from red blood cell breakdown'),
('direct_bilirubin', 'Direct Bilirubin', 'liver', 'mg/dL', 0, 0.3, 0, 10, 'Conjugated bilirubin'),
('indirect_bilirubin', 'Indirect Bilirubin', 'liver', 'mg/dL', 0.1, 0.9, 0, 15, 'Unconjugated bilirubin'),
('total_protein', 'Total Protein', 'liver', 'g/dL', 6.0, 8.3, 4.0, 10.0, 'Total protein in blood'),
('albumin', 'Albumin', 'liver', 'g/dL', 3.5, 5.5, 2.0, 6.5, 'Main protein made by liver'),
('globulin', 'Globulin', 'liver', 'g/dL', 2.0, 3.5, 1.0, 5.0, 'Group of proteins in blood'),
('ag_ratio', 'A/G Ratio', 'liver', 'ratio', 1.0, 2.5, 0.5, 4.0, 'Albumin to globulin ratio'),
('ggt', 'GGT', 'liver', 'U/L', 0, 51, 0, 500, 'Gamma-glutamyl transferase - liver enzyme');

-- Lipid Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('total_cholesterol', 'Total Cholesterol', 'lipid', 'mg/dL', 125, 200, 50, 400, 'Total cholesterol in blood'),
('hdl_cholesterol', 'HDL Cholesterol', 'lipid', 'mg/dL', 40, 60, 20, 100, 'High-density lipoprotein - good cholesterol'),
('ldl_cholesterol', 'LDL Cholesterol', 'lipid', 'mg/dL', 0, 100, 0, 300, 'Low-density lipoprotein - bad cholesterol'),
('vldl_cholesterol', 'VLDL Cholesterol', 'lipid', 'mg/dL', 2, 30, 0, 100, 'Very low-density lipoprotein'),
('triglycerides', 'Triglycerides', 'lipid', 'mg/dL', 0, 150, 0, 500, 'Type of fat in blood'),
('cholesterol_hdl_ratio', 'Total Cholesterol/HDL Ratio', 'lipid', 'ratio', 0, 5.0, 0, 10.0, 'Risk indicator for heart disease'),
('ldl_hdl_ratio', 'LDL/HDL Ratio', 'lipid', 'ratio', 0, 3.5, 0, 8.0, 'Risk indicator for heart disease'),
('non_hdl_cholesterol', 'Non-HDL Cholesterol', 'lipid', 'mg/dL', 0, 130, 0, 350, 'Total cholesterol minus HDL');

-- Thyroid Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('tsh', 'TSH', 'thyroid', 'μIU/mL', 0.4, 4.0, 0.1, 20.0, 'Thyroid stimulating hormone'),
('t3', 'T3', 'thyroid', 'ng/dL', 80, 200, 40, 400, 'Triiodothyronine'),
('t4', 'T4', 'thyroid', 'μg/dL', 4.5, 12.0, 2.0, 20.0, 'Thyroxine'),
('free_t3', 'Free T3', 'thyroid', 'pg/mL', 2.0, 4.4, 1.0, 8.0, 'Free triiodothyronine'),
('free_t4', 'Free T4', 'thyroid', 'ng/dL', 0.8, 1.8, 0.4, 4.0, 'Free thyroxine');

-- Complete Blood Count (CBC) Panel
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('hemoglobin', 'Hemoglobin', 'blood_count', 'g/dL', 12.0, 17.5, 7.0, 20.0, 'Oxygen-carrying protein in red blood cells'),
('hematocrit', 'Hematocrit', 'blood_count', '%', 36.0, 52.0, 20.0, 65.0, 'Percentage of blood volume occupied by red blood cells'),
('rbc_count', 'RBC Count', 'blood_count', 'million/μL', 4.0, 6.0, 2.0, 8.0, 'Red blood cell count'),
('wbc_count', 'WBC Count', 'blood_count', 'thousand/μL', 4.0, 11.0, 1.0, 30.0, 'White blood cell count'),
('platelet_count', 'Platelet Count', 'blood_count', 'thousand/μL', 150, 400, 50, 1000, 'Blood clotting cells'),
('mcv', 'MCV', 'blood_count', 'fL', 80, 100, 60, 120, 'Mean corpuscular volume - average red blood cell size'),
('mch', 'MCH', 'blood_count', 'pg', 27, 33, 20, 40, 'Mean corpuscular hemoglobin'),
('mchc', 'MCHC', 'blood_count', 'g/dL', 32, 36, 28, 40, 'Mean corpuscular hemoglobin concentration'),
('rdw', 'RDW', 'blood_count', '%', 11.5, 14.5, 10.0, 20.0, 'Red cell distribution width'),
('neutrophils', 'Neutrophils', 'blood_count', '%', 40, 70, 20, 90, 'Type of white blood cell'),
('lymphocytes', 'Lymphocytes', 'blood_count', '%', 20, 40, 10, 60, 'Type of white blood cell'),
('monocytes', 'Monocytes', 'blood_count', '%', 2, 8, 0, 15, 'Type of white blood cell'),
('eosinophils', 'Eosinophils', 'blood_count', '%', 1, 4, 0, 10, 'Type of white blood cell'),
('basophils', 'Basophils', 'blood_count', '%', 0, 1, 0, 3, 'Type of white blood cell');

-- Other Common Biomarkers
INSERT INTO biomarker_definitions (name_normalized, display_name, category, unit, ref_range_low, ref_range_high, critical_low, critical_high, description) VALUES
('esr', 'ESR', 'other', 'mm/hr', 0, 20, 0, 100, 'Erythrocyte sedimentation rate - inflammation marker'),
('crp', 'C-Reactive Protein', 'other', 'mg/L', 0, 3.0, 0, 50.0, 'Inflammation marker'),
('vitamin_d', 'Vitamin D', 'other', 'ng/mL', 30, 100, 10, 150, '25-hydroxyvitamin D'),
('vitamin_b12', 'Vitamin B12', 'other', 'pg/mL', 200, 900, 100, 2000, 'Cobalamin'),
('iron', 'Iron', 'other', 'μg/dL', 60, 170, 20, 300, 'Serum iron'),
('ferritin', 'Ferritin', 'other', 'ng/mL', 12, 300, 5, 1000, 'Iron storage protein'),
('calcium', 'Calcium', 'other', 'mg/dL', 8.5, 10.5, 6.0, 14.0, 'Serum calcium'),
('phosphorus', 'Phosphorus', 'other', 'mg/dL', 2.5, 4.5, 1.0, 8.0, 'Serum phosphorus'),
('sodium', 'Sodium', 'other', 'mEq/L', 136, 145, 120, 160, 'Serum sodium'),
('potassium', 'Potassium', 'other', 'mEq/L', 3.5, 5.0, 2.5, 7.0, 'Serum potassium'),
('chloride', 'Chloride', 'other', 'mEq/L', 98, 107, 85, 120, 'Serum chloride'),
('magnesium', 'Magnesium', 'other', 'mg/dL', 1.7, 2.2, 1.0, 4.0, 'Serum magnesium');

-- Comments
COMMENT ON TABLE biomarker_definitions IS 'Reference data for biomarker normalization, units, and reference ranges';
