/** Mirrors the payloads served by deepdoc_server. */

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

export interface RubricCriterion {
  code: string;
  /** Multipart field name this criterion's PDFs must be uploaded under. */
  field: string;
  title: string;
  evidenceRequirement: string;
}

export interface RubricDimension {
  index: number;
  title: string;
  weight: number;
  criteria: RubricCriterion[];
}

/** `GET /submissions/form-schema` — the client renders its form from this. */
export interface FormSchema {
  projectField: string;
  maxTotalScore: number;
  dimensions: RubricDimension[];
}

export interface DimensionScore {
  index: number;
  title: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface AnalysisResult {
  summary: string;
  overallScore: number;
  overallComment: string;
  dimensions: DimensionScore[];
  model: string;
  analyzedAt: string;
  notes: string[];
}

export interface Submitter {
  name: string;
  projectName: string;
  department: string;
  email: string;
  phone: string;
}

export interface EvidenceFile {
  criterionCode: string | null;
  criterionTitle: string | null;
  filename: string;
  url: string;
}

export interface Submission {
  id: string;
  submitter: Submitter;
  status: AnalysisStatus;
  createdAt: string;
  attempts: number;
  failureReason: string | null;
  report: { filename: string; url: string };
  evidence: EvidenceFile[];
  analysis: AnalysisResult | null;
}
