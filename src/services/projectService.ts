import { Project, PROGRESS_STEPS, UserRole } from "@/lib/constants";
import supabase from "@/lib/supabase";

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

// Helper to transform data from Supabase format to app format
const transformProjectData = (project: any, steps: any[]): Project => {
  const transformedSteps = PROGRESS_STEPS.map(progressStep => {
    const foundStep = steps.find(s => s.step_id === progressStep.id);
    return {
      stepId: progressStep.id,
      completed: foundStep?.completed || false,
      documentUrl: foundStep?.document_url,
      documentName: foundStep?.document_name,
      updatedAt: foundStep?.updated_at
    };
  });
  
  // Calculate progress
  const completedSteps = transformedSteps.filter(s => s.completed).length;
  const progress = (completedSteps / transformedSteps.length) * 100;
  
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.created_at,
    createdBy: project.created_by,
    progress,
    steps: transformedSteps
  };
};

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Get all projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error("Supabase error fetching projects:", projectsError);
      return MOCK_PROJECTS;
    }
    
    // Get all project steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('project_steps')
      .select('*');
    
    if (stepsError) {
      console.error("Supabase error fetching project steps:", stepsError);
      return MOCK_PROJECTS;
    }
    
    // Map projects with their steps
    const projects = projectsData.map(project => {
      const projectSteps = stepsData.filter(step => step.project_id === project.id);
      return transformProjectData(project, projectSteps);
    });
    
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return MOCK_PROJECTS;
  }
};

// Get a single project by ID
export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    // Get project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (projectError) {
      console.error("Supabase error fetching project:", projectError);
      return MOCK_PROJECTS.find(p => p.id === id);
    }
    
    // Get project steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('project_steps')
      .select('*')
      .eq('project_id', id);
    
    if (stepsError) {
      console.error("Supabase error fetching project steps:", stepsError);
      return MOCK_PROJECTS.find(p => p.id === id);
    }
    
    return transformProjectData(projectData, stepsData);
  } catch (error) {
    console.error("Error fetching project:", error);
    return MOCK_PROJECTS.find(p => p.id === id);
  }
};

// Create a new project
export const createProject = async (project: Omit<Project, "id" | "progress">): Promise<Project> => {
  try {
    // Insert project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          title: project.title,
          description: project.description,
          created_at: project.createdAt,
          created_by: project.createdBy
        }
      ])
      .select()
      .single();
    
    if (projectError) {
      console.error("Supabase error creating project:", projectError);
      throw new Error(projectError.message);
    }
    
    // Create empty steps
    const stepsToInsert = PROGRESS_STEPS.map(step => ({
      project_id: newProject.id,
      step_id: step.id,
      completed: false
    }));
    
    const { error: stepsError } = await supabase
      .from('project_steps')
      .insert(stepsToInsert);
    
    if (stepsError) {
      console.error("Supabase error creating project steps:", stepsError);
      throw new Error(stepsError.message);
    }
    
    // Return the newly created project with empty steps
    return {
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      createdAt: newProject.created_at,
      createdBy: newProject.created_by,
      progress: 0,
      steps: PROGRESS_STEPS.map(step => ({
        stepId: step.id,
        completed: false
      }))
    };
  } catch (error) {
    console.error("Error creating project:", error);
    
    // Fallback to mock implementation
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
    return newProject;
  }
};

// Update a project step
export const updateProjectStep = async (
  projectId: string,
  stepId: number,
  update: {
    completed: boolean;
    documentUrl?: string;
    documentName?: string;
  }
): Promise<Project | undefined> => {
  try {
    // Update the project step
    const { error: updateError } = await supabase
      .from('project_steps')
      .update({
        completed: update.completed,
        document_url: update.documentUrl,
        document_name: update.documentName,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('step_id', stepId);
    
    if (updateError) {
      console.error("Supabase error updating project step:", updateError);
      throw new Error(updateError.message);
    }
    
    // Return the updated project
    return await getProjectById(projectId);
  } catch (error) {
    console.error("Error updating project step:", error);
    
    // Fallback to mock implementation
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
        return project;
      }
    }
    
    return undefined;
  }
};

// Delete a document from a step
export const deleteDocument = async (
  projectId: string,
  stepId: number
): Promise<Project | undefined> => {
  try {
    // Update project step to remove document
    const { error: updateError } = await supabase
      .from('project_steps')
      .update({
        completed: false,
        document_url: null,
        document_name: null,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('step_id', stepId);
    
    if (updateError) {
      console.error("Supabase error deleting document:", updateError);
      throw new Error(updateError.message);
    }
    
    // If document was stored in Supabase Storage, delete it
    // (This would require knowing the exact path)
    
    // Return the updated project
    return await getProjectById(projectId);
  } catch (error) {
    console.error("Error deleting document:", error);
    
    // Fallback to mock implementation
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
        return project;
      }
    }
    
    return undefined;
  }
};

// Upload a document to Supabase Storage
export const uploadDocument = async (
  file: File,
  projectId: string,
  stepId: number
): Promise<string | null> => {
  try {
    const filePath = `projects/${projectId}/step_${stepId}/${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }
    
    // Get public URL for the uploaded file
    const { data: publicUrl } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    return publicUrl.publicUrl;
  } catch (error) {
    console.error("Error uploading document:", error);
    return null;
  }
};
