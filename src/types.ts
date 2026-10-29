// SkillProof Type Definitions

export type EvidenceStatus =
  | 'evidence_found'
  | 'not_found'
  | 'needs_assessment'
  | 'inspection_incomplete';

export interface EvidenceItem {
  file: string;
  filePath: string;
  htmlUrl: string;
  snippet: string;
  relevance: string;
}

export interface SkillResult {
  skill: string;
  status: EvidenceStatus;
  evidence: EvidenceItem[];
  limitations: string[];
  filesInspected: number;
  totalFilesAvailable: number;
}

export interface AnalysisResult {
  repoUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  skills: SkillResult[];
  inspectionSummary: {
    totalFilesInRepo: number;
    filesInspected: number;
    filesSkipped: number;
    inspectionTimestamp: string;
    apiCallsMade: number;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  download_url: string | null;
  html_url: string;
  encoding?: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  default_branch: string;
  html_url: string;
  description: string | null;
  private: boolean;
}

export type Page = 'home' | 'analyze' | 'results' | 'about';

export const TECHNICAL_SKILLS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C/C++',
  'React',
  'SQL',
  'Git',
  'Docker',
  'HTML/CSS',
  'Node.js',
  'REST APIs',
  'Data Analysis',
  'Machine Learning',
  'Testing',
  'CI/CD',
  'Cloud (AWS/GCP/Azure)',
  'Linux/Shell',
  'MongoDB/NoSQL',
  'Algorithms',
] as const;

export type TechnicalSkill = (typeof TECHNICAL_SKILLS)[number];
