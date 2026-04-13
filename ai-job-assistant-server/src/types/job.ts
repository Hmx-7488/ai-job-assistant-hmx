// src/types/job.ts
export interface CreateJobRequest {
  jobTitle: string;
  companyName?: string;
  jd: string;
}

export interface JobResponse {
  jobId: string;
  createdAt: Date;
}