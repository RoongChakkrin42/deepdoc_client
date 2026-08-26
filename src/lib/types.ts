/** Mirrors the payloads served by deepdoc_server. */

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** The five official maturity levels, best-first. */
export type LevelId =
  | 'outstanding'
  | 'mature'
  | 'developing'
  | 'beginning'
  | 'inadequate';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

export interface RubricCriterion {
  code: string;
  title: string;
  evidenceRequirement: string;
  /** What a grader has to be able to tick off before this criterion counts. */
  checks: string[];
}

export interface RubricDimension {
  index: number;
  title: string;
  focus: string;
  /** Percentage weight of this dimension in the total. */
  weight: number;
  criteria: RubricCriterion[];
}

export interface LevelDefinition {
  id: LevelId;
  label: string;
  english: string;
  band: string;
}

export interface AwardTierDefinition {
  id: string;
  label: string;
  minScore: number;
  description: string;
}

/** `GET /submissions/form-schema` — the client renders its form from this. */
export interface FormSchema {
  projectField: string;
  maxTotalScore: number;
  levels: LevelDefinition[];
  awardTiers: AwardTierDefinition[];
  dimensions: RubricDimension[];
}

export interface CriterionScore {
  code: string;
  title: string;
  level: LevelId;
  levelLabel: string;
  /** Representative points for the level, 0-100. */
  score: number;
  evidenceFound: string[];
  missing: string[];
  comment: string;
}

export interface DimensionScore {
  index: number;
  title: string;
  weight: number;
  /** Mean of the dimension's criterion scores, 0-100. */
  score: number;
  /** Points this dimension contributes to the total. */
  weightedScore: number;
  level: LevelId;
  levelLabel: string;
  criteria: CriterionScore[];
}

export interface AwardTier {
  id: string;
  label: string;
  description: string;
}

export interface AnalysisResult {
  summary: string;
  /** Weighted total, 0-100. Carries decimals — dimensions are averages. */
  overallScore: number;
  overallComment: string;
  award: AwardTier;
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

export interface Submission {
  id: string;
  submitter: Submitter;
  status: AnalysisStatus;
  createdAt: string;
  attempts: number;
  failureReason: string | null;
  report: { filename: string; url: string };
  analysis: AnalysisResult | null;
}
