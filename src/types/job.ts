export interface JobPosting {
  employment_company_id: number;
  employment_id: number;
  title: string;
  company_name: string;
  view_count: number;
  resume_count: number;
  created_at: string;
  updated_at: string;
  deadline: string;
  description: string;
}

export interface JobResponse {
  success: boolean;
  data: JobPosting;
  message?: string;
}
