
export const PROGRESS_STEPS = [
  { id: 1, title: 'Application Submitted', description: 'Submit initial application to GEDA' },
  { id: 2, title: 'GEDA Letter', description: 'Receive approval letter from GEDA' },
  { id: 3, title: 'Document Verified', description: 'Verify all required documentation' },
  { id: 4, title: 'Feasibility Approved', description: 'Technical feasibility check and approval' },
  { id: 5, title: 'CEI Approval', description: 'Chief Electrical Inspector approval' },
  { id: 6, title: 'Work Starts', description: 'Initiation of installation work' },
  { id: 7, title: 'CEI Inspection', description: 'Final inspection by Chief Electrical Inspector' },
  { id: 8, title: 'Meter Installation', description: 'Submit meter installation application' }
];

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  progress: number;
  steps: ProjectStep[];
}

export interface ProjectStep {
  stepId: number;
  completed: boolean;
  documentUrl?: string;
  documentName?: string;
  updatedAt?: string;
}
