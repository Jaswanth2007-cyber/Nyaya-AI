export type LegalSubject =
  | 'Contract Law'
  | 'Criminal Law'
  | 'Tort / Negligence'
  | 'Constitutional Law'
  | 'Intellectual Property'
  | 'Cyber Law'
  | 'International Law';

export type Jurisdiction =
  | 'India'
  | 'United States'
  | 'United Kingdom'
  | 'General / Educational';

export interface CaseInput {
  facts: string;
  issue: string;
  subject: LegalSubject;
  jurisdiction: Jurisdiction;
}

export interface IracArgument {
  issue: string;
  rule: string;
  application: string;
  conclusion: string;
  general_principles: string[];
  assumptions: string[];
  limitations: string[];
  educational_notice: string;
}

export interface Counterargument {
  opposition_position: string;
  opposing_arguments: string[];
  student_weaknesses: string[];
  rebuttal_directions: string[];
}

export interface KeyLegalTerm {
  term: string;
  meaning: string;
  simple_example?: string;
}

export interface LegalExplanation {
  plain_explanation: string;
  key_legal_terms: KeyLegalTerm[];
  reasoning_breakdown: string[];
  nuances_limitations: string[];
}

export interface CaseSession {
  id: string;
  timestamp: number;
  title: string;
  input: CaseInput;
  argument: IracArgument | null;
  counterargument: Counterargument | null;
  explanation: LegalExplanation | null;
  status: 'draft' | 'argued' | 'complete';
}

export interface GenerateRequest {
  facts: string;
  issue: string;
  subject: string;
  jurisdiction: string;
}

export interface CounterargumentRequest {
  facts: string;
  issue: string;
  subject: string;
  jurisdiction: string;
  argument?: IracArgument | null;
}

export interface ExplainRequest {
  reasoning_text: string;
  subject?: string;
  jurisdiction?: string;
}

export interface ApiHealthResponse {
  status: string;
  version?: string;
  message?: string;
}

export interface SampleCasePreset {
  id: string;
  title: string;
  subject: LegalSubject;
  jurisdiction: Jurisdiction;
  description: string;
  tag: string;
  input: CaseInput;
}
