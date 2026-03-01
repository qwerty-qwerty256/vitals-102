'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Leaf, Upload, FileText } from 'lucide-react';
import { useProfiles } from '@/lib/hooks/useProfiles';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useProfileStore } from '@/lib/store/profileStore';
import { useAuthStore } from '@/lib/store/authStore';
import { HealthSummaryCard } from '@/components/dashboard/HealthSummaryCard';
import { BiomarkerGrid } from '@/components/dashboard/BiomarkerGrid';
import { ProfileSwitcher } from '@/components/layout/ProfileSwitcher';
import { UploadButton } from '@/components/reports/UploadButton';
import { ReportCard } from '@/components/reports/ReportCard';
import { LHMViewer } from '@/components/lhm/LHMViewer';
import { useReports } from '@/lib/hooks/useReports';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { activeProfileId, setActiveProfile, getActiveProfile } = useProfileStore();
  const [showLHM, setShowLHM] = useState(false);

  const activeProfile = getActiveProfile(profiles);

  useEffect(() => {
    if (!activeProfileId && profiles.length > 0) {
      const def = profiles.find((p) => p.isDefault) ?? profiles[0];
      if (def) setActiveProfile(def.id);
    }
  }, [profiles, activeProfileId, setActiveProfile]);

  const profileId = activeProfile?.id ?? null;
  const { data: dashboard, isLoading: dashLoading } = useDashboard(profileId);
  const { data: reports = [] } = useReports(profileId);

  const alertCount = dashboard?.latestBiomarkers.filter(
    (b) => b.status === 'high' || b.status === 'low'
  ).length ?? 0;

  const recentReports = reports.slice(0, 3);
  const isEmpty = !dashLoading && (!dashboard || reports.length === 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky-header px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium">Good day,</p>
            <p className="text-sm font-bold text-foreground leading-tight truncate">
              {user?.name?.split(' ')[0] ?? 'there'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {profileId && <UploadButton profileId={profileId} variant="icon" />}
          {profiles.length > 0 && (
            <ProfileSwitcher
              profiles={profiles}
              activeProfileId={activeProfile?.id ?? null}
              onChange={setActiveProfile}
            />
          )}
        </div>
      </header>

      <main className="flex-1 py-4 space-y-5">
        {/* Loading state */}
        {(profilesLoading || dashLoading) && (
          <div className="space-y-4 px-4">
            <div className="h-40 skeleton rounded-2xl" />
            <div className="h-5 w-32 skeleton rounded" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 skeleton rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!profilesLoading && !dashLoading && isEmpty && (
          <EmptyState profileId={profileId} />
        )}

        {/* Content */}
        {!profilesLoading && !dashLoading && activeProfile && dashboard && (
          <>
            <HealthSummaryCard
              profile={activeProfile}
              summary={dashboard.summary}
              alertCount={alertCount}
            />

            {/* LHM Button */}
            {dashboard.lhm && (
              <div className="px-4">
                <button
                  onClick={() => setShowLHM(true)}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-card transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">View Health Summary</p>
                      <p className="text-xs text-white/80">Living Health Markdown</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/80" />
                </button>
              </div>
            )}

            {dashboard.latestBiomarkers.length > 0 && (
              <section>
                <div className="flex items-center justify-between px-4 mb-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Key Markers</h2>
                  <Link href="/reports" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
                    View all <ChevronRight size={13} />
                  </Link>
                </div>
                <BiomarkerGrid biomarkers={dashboard.latestBiomarkers} />
              </section>
            )}

            {recentReports.length > 0 && (
              <section>
                <div className="flex items-center justify-between px-4 mb-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">Recent Reports</h2>
                  <Link href="/reports" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
                    All reports <ChevronRight size={13} />
                  </Link>
                </div>
                <div className="px-4 space-y-3">
                  {recentReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* LHM Viewer Modal */}
      {dashboard?.lhm && activeProfile && (
        <LHMViewer
          markdown={dashboard.lhm.markdown}
          profileName={activeProfile.name}
          isOpen={showLHM}
          onClose={() => setShowLHM(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ profileId }: { profileId: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6">
        <Leaf size={40} className="text-primary-400" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        Your health journey starts here
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Upload your first health report to track your biomarkers and get AI-powered insights.
      </p>
      {profileId && (
        <UploadButton profileId={profileId} variant="primary" label="Upload Report" />
      )}
    </div>
  );
}
