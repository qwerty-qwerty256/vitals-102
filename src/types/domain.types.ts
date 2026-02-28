// Domain type definitions

export interface User {
  id: string;
  email: string;
  name?: string;
  supabaseUserId: string;
  createdAt: Date;
}

export type RelationshipType = 
  | 'self' 
  | 'mother' 
  | 'father' 
  | 'spouse' 
  | 'grandmother' 
  | 'grandfather' 
  | 'other';

export type GenderType = 'male' | 'female' | 'other';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  relationship: RelationshipType;
  dob?: Date;
  gender?: GenderType;
  isDefault: boolean;
  createdAt: Date;
}

export type ReportStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface Report {
  id: string;
  userId: string;
  profileId: string;
  fileUrl: string;
  reportDate?: Date;
  rawOcrMarkdown?: string;
  processingStatus: ReportStatus;
  uploadedAt: Date;
}

export interface Biomarker {
  id: string;
  reportId: string;
  userId: string;
  profileId: string;
  name: string;
  nameNormalized: string;
  category?: string;
  value: number;
  unit: string;
  reportDate?: Date;
  createdAt: Date;
}

export interface BiomarkerDefinition {
  nameNormalized: string;
  displayName: string;
  category: string;
  unit: string;
  refRangeLow?: number;
  refRangeHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  description?: string;
}

export type BiomarkerStatusType = 'normal' | 'borderline' | 'high' | 'low';
export type TrendType = 'improving' | 'worsening' | 'stable' | 'new';

export interface BiomarkerStatus {
  biomarker: Biomarker;
  definition: BiomarkerDefinition;
  status: BiomarkerStatusType;
  trend?: TrendType;
}

export interface LHMDocument {
  profileId: string;
  userId: string;
  markdown: string;
  version: number;
  lastUpdatedAt: Date;
  lastReportDate?: Date;
  tokensApprox?: number;
}

export interface LHMHistory {
  id: string;
  profileId: string;
  markdown: string;
  version: number;
  createdAt: Date;
}

export interface ReportEmbedding {
  id: string;
  reportId: string;
  userId: string;
  profileId: string;
  chunkText: string;
  embedding: number[];
  createdAt: Date;
}

export type DigestFrequency = 'monthly' | 'quarterly';

export interface NotificationPreferences {
  userId: string;
  emailDigestEnabled: boolean;
  digestFrequency: DigestFrequency;
  lastSentAt?: Date;
}
