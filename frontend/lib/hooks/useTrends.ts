'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface BiomarkerTrendData {
  nameNormalized: string;
  displayName: string;
  category: string;
  unit: string;
  refRangeLow?: number;
  refRangeHigh?: number;
  history: Array<{
    date: string;
    value: number;
    status: 'normal' | 'high' | 'low' | 'borderline';
  }>;
}

export const useBiomarkerTrends = (profileId: string | null) => {
  return useQuery({
    queryKey: ['biomarker-trends', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await apiClient.get<{ trends: BiomarkerTrendData[] }>(
        `/biomarkers/trends`,
        { params: { profileId } }
      );
      return data.trends;
    },
    enabled: !!profileId,
  });
};
