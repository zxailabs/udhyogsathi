export type SectionId =
  | "msme"
  | "loans"
  | "midc"
  | "startup"
  | "licenses"
  | "export"
  | "mahila_yuva"
  | "updates";

export interface DepartmentWing {
  title: string;
  tag: string;
  description: string;
  portalUrl?: string;
}

export interface DepartmentInfo {
  id: SectionId;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  glowColor: string;
  iconName: string;
  officialName: string;
  nodalAgency: string;
  website: string;
  helpline: string;
  about: string;
  wings: DepartmentWing[];
  quickQuestions: string[];
  hasSchemeFinderLink?: boolean;
}

export interface KnowledgeRecord {
  id: string;
  section: SectionId;
  governmentType?: "state" | "central";
  title: string;
  department: string;
  grReference: string;
  officialUrl: string;
  keywords: string[];
  summary: string;
  eligibility: string[];
  documents: string[];
  steps: string[];
  benefits: string;
  leadershipNote?: string;
  latestUpdate?: string;
}

export interface KnowledgeSearchResult {
  record: KnowledgeRecord;
  score: number;
}

export interface EntrepreneurProfile {
  name: string;
  mobile?: string;
  district: string;
  caste?: string;
  sector: string;
  stage: string;
  udyamNumber?: string;
  updatedAt?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface VerifiedSourceMeta {
  id: string;
  title: string;
  department: string;
  grReference: string;
  officialUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  verifiedSource?: VerifiedSourceMeta | null;
  groundingSources?: GroundingSource[];
  modelUsed?: string;
  isOfflineFallback?: boolean;
}

