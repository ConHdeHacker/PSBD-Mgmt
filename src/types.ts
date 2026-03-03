export interface Profile {
  id: string;
  name: string;
}

export interface Opportunity {
  id: number;
  profile_id: string;
  client_name: string;
  rfp_date: string;
  questions_date: string;
  sector: string;
  owner: string;
  status: string;
  description: string;
  documents?: OpportunityDocument[];
  profiles?: OpportunityProfile[];
  tools?: OpportunityTool[];
  hours?: OpportunityHoursLog[];
}

export interface OpportunityDocument {
  id: number;
  opportunity_id: number;
  type: 'RFP' | 'ADDITIONAL' | 'TECHNICAL_OFFER';
  file_name: string;
  file_path: string;
  mime_type: string;
}

export interface OpportunityProfile {
  id: number;
  opportunity_id: number;
  profile_title: string;
  csr: string;
  quantity: number;
  cost: number;
}

export interface OpportunityTool {
  id: number;
  opportunity_id: number;
  tool_name: string;
  cost: number;
}

export interface OpportunityHoursLog {
  id: number;
  opportunity_id: number;
  staff_name: string;
  hours: number;
  date: string;
}

export interface OpportunityHoursSummary {
  client_name: string;
  staff_name: string;
  total_hours: number;
}

export interface Position {
  id: number;
  profile_id: string;
  title: string;
  description: string;
  status: string;
  everjob_code?: string;
  ciber_ongoing?: boolean;
  interviewers?: string;
  categories?: string;
  salary_range?: string;
  required_education?: string;
  complementary_training?: string;
  fundamental_knowledge?: string;
  valuable_knowledge?: string;
  languages?: string;
}

export interface Candidate {
  id: number;
  position_id: number;
  name: string;
  type: 'STAFF' | 'BECA';
  status: string;
  notes?: string;
  years_experience?: number;
  salary_band?: string;
  cv_path?: string;
  education?: string;
  certifications?: string;
  knowledge?: string;
  languages?: string;
  city?: string;
  incorporation_date?: string;
  position_title?: string;
}

export interface Staff {
  id: number;
  profile_id: string;
  name: string;
  email: string;
  employee_number: string;
  csr: string;
  seniority_date: string;
  salary_profile: string;
  category_band: string;
  cv_path?: string;
  annual?: StaffAnnual[];
  vacations?: StaffVacation[];
}

export interface StaffAnnual {
  id: number;
  staff_id: number;
  type: string;
  content: string;
}

export interface StaffVacation {
  id: number;
  staff_id: number;
  start_date: string;
  end_date: string;
  days: number;
}

export interface Client {
  id: number;
  profile_id: string;
  name: string;
  info: string;
  projects?: Project[];
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  code: string;
  description: string;
  costs: number;
  sales_price: number;
}

export interface WorkHour {
  id: number;
  staff_id: number;
  project_id: number;
  date: string;
  hours: number;
  cost_per_hour: number;
  sales_per_hour: number;
  staff_name?: string;
  project_name?: string;
}

export interface EconomicSummary {
  id: number;
  name: string;
  total_costs: number;
  total_sales: number;
  projects: (Project & { total_costs: number; total_sales: number })[];
}

export interface WorkHoursSummary {
  staff_name: string;
  project_name: string;
  total_hours: number;
  total_cost: number;
  total_sales: number;
}

export interface VersionInfo {
  current: string;
  latest: string;
  changes: string[];
  error?: string;
}
