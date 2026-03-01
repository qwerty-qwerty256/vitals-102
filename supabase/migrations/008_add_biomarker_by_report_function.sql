-- Create a function to join biomarkers with definitions by report_id
-- This allows fetching biomarkers for a specific report without foreign key constraint

CREATE OR REPLACE FUNCTION get_biomarkers_by_report(p_report_id UUID)
RETURNS TABLE (
  id UUID,
  report_id UUID,
  user_id UUID,
  profile_id UUID,
  name TEXT,
  name_normalized TEXT,
  category TEXT,
  value NUMERIC,
  unit TEXT,
  report_date DATE,
  created_at TIMESTAMPTZ,
  def_name_normalized TEXT,
  def_display_name TEXT,
  def_category TEXT,
  def_unit TEXT,
  def_ref_range_low NUMERIC,
  def_ref_range_high NUMERIC,
  def_critical_low NUMERIC,
  def_critical_high NUMERIC,
  def_description TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    b.id,
    b.report_id,
    b.user_id,
    b.profile_id,
    b.name,
    b.name_normalized,
    b.category,
    b.value,
    b.unit,
    b.report_date,
    b.created_at,
    bd.name_normalized as def_name_normalized,
    bd.display_name as def_display_name,
    bd.category as def_category,
    bd.unit as def_unit,
    bd.ref_range_low as def_ref_range_low,
    bd.ref_range_high as def_ref_range_high,
    bd.critical_low as def_critical_low,
    bd.critical_high as def_critical_high,
    bd.description as def_description
  FROM biomarkers b
  LEFT JOIN biomarker_definitions bd ON b.name_normalized = bd.name_normalized
  WHERE b.report_id = p_report_id
  ORDER BY b.name_normalized ASC;
$$;

-- Add comment
COMMENT ON FUNCTION get_biomarkers_by_report IS 'Get biomarkers for a specific report with their definitions using LEFT JOIN (allows unknown biomarkers)';
