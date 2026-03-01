import { Request, Response, NextFunction } from 'express';
import { biomarkerService } from '../../services/biomarker.service';
import { biomarkerRepository } from '../../repositories/biomarker.repository';

/**
 * GET /api/biomarkers/trends?profileId=xxx
 * Get biomarker trends for a profile (only biomarkers with 2+ data points)
 */
export async function getBiomarkerTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { profileId } = req.query;

    if (!profileId || typeof profileId !== 'string') {
      return res.status(400).json({ error: 'profileId is required' });
    }

    // Get all biomarkers with definitions
    const biomarkers = await biomarkerRepository.findByProfileWithDefinitions(profileId);

    // Group by nameNormalized and filter those with 2+ readings
    const biomarkerGroups = biomarkers.reduce<Record<string, typeof biomarkers>>((acc, b) => {
      if (!acc[b.nameNormalized]) acc[b.nameNormalized] = [];
      acc[b.nameNormalized].push(b);
      return acc;
    }, {});

    // Build trend data for biomarkers with 2+ readings
    const trends = Object.entries(biomarkerGroups)
      .filter(([_, group]) => group.length >= 2)
      .map(([nameNormalized, group]) => {
        // Sort by date ascending
        const sorted = group.sort((a, b) => 
          new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
        );

        const latest = sorted[sorted.length - 1];
        const definition = latest.definition;

        return {
          nameNormalized,
          displayName: definition?.displayName || latest.name,
          category: definition?.category || latest.category,
          unit: definition?.unit || latest.unit,
          refRangeLow: definition?.refRangeLow,
          refRangeHigh: definition?.refRangeHigh,
          history: sorted.map(b => ({
            date: b.reportDate.toISOString(),
            value: b.value,
            status: biomarkerService.calculateStatus(b.value, b.definition || undefined),
          })),
        };
      });

    res.json({ trends });
  } catch (error) {
    next(error);
  }
}
