
import { Project, PROGRESS_STEPS } from "@/lib/constants";

// Mock data for projects
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Solar Installation Project - ABC Corp",
    description: "Installation of 50kW solar panels on the commercial building",
    createdAt: "2025-04-01",
    createdBy: "1", // admin user ID
    progress: 37.5,
    steps: [
      { stepId: 1, completed: true, documentUrl: "#", documentName: "application-form.pdf", updatedAt: "2025-04-01" },
      { stepId: 2, completed: true, documentUrl: "#", documentName: "geda-approval.pdf", updatedAt: "2025-04-02" },
      { stepId: 3, completed: true, documentUrl: "#", documentName: "verification-docs.zip", updatedAt: "2025-04-03" },
      { stepId: 4, completed: false },
      { stepId: 5, completed: false },
      { stepId: 6, completed: false },
      { stepId: 7, completed: false },
      { stepId: 8, completed: false }
    ]
  },
  {
    id: "2",
    title: "Wind Energy Assessment - XYZ Inc",
    description: "Feasibility study for wind energy implementation",
    createdAt: "2025-03-28",
    createdBy: "1", // admin user ID
    progress: 12.5,
    steps: [
      { stepId: 1, completed: true, documentUrl: "#", documentName: "assessment-request.pdf", updatedAt: "2025-03-28" },
      { stepId: 2, completed: false },
      { stepId: 3, completed: false },
      { stepId: 4, completed: false },
      { stepId: 5, completed: false },
      { stepId: 6, completed: false },
      { stepId: 7, completed: false },
      { stepId: 8, completed: false }
    ]
  },
  {
    id: "3",
    title: "Residential Solar Project - Green Homes",
    description: "10kW solar installation for residential complex",
    createdAt: "2025-03-15",
    createdBy: "1", // admin user ID
    progress: 62.5,
    steps: [
      { stepId: 1, completed: true, documentUrl: "#", documentName: "application.pdf", updatedAt: "2025-03-15" },
      { stepId: 2, completed: true, documentUrl: "#", documentName: "geda-approval.pdf", updatedAt: "2025-03-16" },
      { stepId: 3, completed: true, documentUrl: "#", documentName: "documentation.zip", updatedAt: "2025-03-18" },
      { stepId: 4, completed: true, documentUrl: "#", documentName: "feasibility-report.pdf", updatedAt: "2025-03-20" },
      { stepId: 5, completed: true, documentUrl: "#", documentName: "cei-approval.pdf", updatedAt: "2025-03-22" },
      { stepId: 6, completed: false },
      { stepId: 7, completed: false },
      { stepId: 8, completed: false }
    ]
  }
];

// Get all projects
export const getProjects = (): Promise<Project[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(MOCK_PROJECTS);
    }, 500);
  });
};

// Get a single project by ID
export const getProjectById = (id: string): Promise<Project | undefined> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const project = MOCK_PROJECTS.find((p) => p.id === id);
      resolve(project);
    }, 500);
  });
};

// Create a new project
export const createProject = (project: Omit<Project, "id" | "progress">): Promise<Project> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const newProject: Project = {
        ...project,
        id: Math.random().toString(36).substring(2, 9),
        progress: 0,
        steps: PROGRESS_STEPS.map(step => ({
          stepId: step.id,
          completed: false
        }))
      };
      
      MOCK_PROJECTS.push(newProject);
      resolve(newProject);
    }, 500);
  });
};

// Update a project step
export const updateProjectStep = (
  projectId: string,
  stepId: number,
  update: {
    completed: boolean;
    documentUrl?: string;
    documentName?: string;
  }
): Promise<Project | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
      
      if (projectIndex > -1) {
        const project = { ...MOCK_PROJECTS[projectIndex] };
        const stepIndex = project.steps.findIndex((s) => s.stepId === stepId);
        
        if (stepIndex > -1) {
          project.steps[stepIndex] = {
            ...project.steps[stepIndex],
            ...update,
            updatedAt: new Date().toISOString().split("T")[0],
          };
          
          // Calculate new progress
          const completedSteps = project.steps.filter((s) => s.completed).length;
          project.progress = (completedSteps / project.steps.length) * 100;
          
          MOCK_PROJECTS[projectIndex] = project;
          resolve(project);
        } else {
          resolve(undefined);
        }
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

// Delete a document from a step
export const deleteDocument = (
  projectId: string,
  stepId: number
): Promise<Project | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
      
      if (projectIndex > -1) {
        const project = { ...MOCK_PROJECTS[projectIndex] };
        const stepIndex = project.steps.findIndex((s) => s.stepId === stepId);
        
        if (stepIndex > -1) {
          project.steps[stepIndex] = {
            ...project.steps[stepIndex],
            completed: false,
            documentUrl: undefined,
            documentName: undefined,
          };
          
          // Calculate new progress
          const completedSteps = project.steps.filter((s) => s.completed).length;
          project.progress = (completedSteps / project.steps.length) * 100;
          
          MOCK_PROJECTS[projectIndex] = project;
          resolve(project);
        } else {
          resolve(undefined);
        }
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};
