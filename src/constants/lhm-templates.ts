// Living Health Markdown template for new profiles
export const LHM_SKELETON_TEMPLATE = `# Living Health Markdown

## Patient Profile
- **Name**: {{name}}
- **Age**: {{age}}
- **Gender**: {{gender}}
- **Last Updated**: {{lastUpdated}}

## Current Health Snapshot
*No health data available yet. Upload your first report to get started.*

## Historical Trends

### Diabetes Panel
| Date | Fasting Blood Sugar | HbA1c | Status |
|------|-------------------|-------|--------|
| - | - | - | - |

### Lipid Panel
| Date | Total Cholesterol | LDL | HDL | Triglycerides | Status |
|------|------------------|-----|-----|---------------|--------|
| - | - | - | - | - | - |

### Kidney Function
| Date | Creatinine | BUN | eGFR | Status |
|------|-----------|-----|------|--------|
| - | - | - | - | - |

### Liver Function
| Date | ALT | AST | ALP | Status |
|------|-----|-----|-----|--------|
| - | - | - | - | - |

## Key Observations
*No observations yet. Key health insights will appear here after uploading reports.*

## Report Log
- **Total Reports**: 0
- **Date Range**: N/A
- **Last Report**: N/A

---
*Version: 1 | Generated: {{timestamp}}*
`;

// Prompt for first report merge
export const LHM_FIRST_REPORT_PROMPT = `You are a health data analyst. A user has uploaded their first health checkup report.

Your task is to update the Living Health Markdown (LHM) document with the extracted biomarker data.

Current LHM:
\`\`\`markdown
{{currentLHM}}
\`\`\`

New biomarker data from report dated {{reportDate}}:
\`\`\`json
{{biomarkers}}
\`\`\`

Instructions:
1. Update the "Current Health Snapshot" section with the latest values
2. Add the first row to each relevant Historical Trends table
3. Generate 2-3 key observations based on the data
4. Update the Report Log section
5. Maintain the exact markdown structure
6. Use the reference ranges to determine status (Normal/High/Low)
7. Increment version number

Return ONLY the updated markdown document, no explanations.`;

// Prompt for subsequent report merges
export const LHM_MERGE_PROMPT = `You are a health data analyst. A user has uploaded a new health checkup report.

Your task is to merge the new biomarker data into the existing Living Health Markdown (LHM) document.

Current LHM:
\`\`\`markdown
{{currentLHM}}
\`\`\`

New biomarker data from report dated {{reportDate}}:
\`\`\`json
{{biomarkers}}
\`\`\`

Instructions:
1. Update "Current Health Snapshot" with the latest values
2. Append new rows to Historical Trends tables (keep most recent 10 entries per table)
3. Regenerate "Key Observations" based on trends and current status
4. Update Report Log section
5. Maintain exact markdown structure
6. Use reference ranges to determine status
7. Identify trends (improving/worsening/stable)
8. Increment version number

Return ONLY the updated markdown document, no explanations.`;
