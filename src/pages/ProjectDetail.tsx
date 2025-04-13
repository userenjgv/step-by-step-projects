
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Project, ProjectStep, PROGRESS_STEPS } from "@/lib/constants";
import {
  getProjectById,
  updateProjectStep,
  deleteDocument,
} from "@/services/projectService";
import {
  CheckCircle2,
  Circle,
  FileText,
  Trash2,
  Upload,
  Download,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [activeDialog, setActiveDialog] = useState<
    "upload" | "view" | "delete" | null
  >(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const data = await getProjectById(projectId);
      if (data) {
        setProject(data);
      } else {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!id || !uploadFile || selectedStep === null) return;

    setIsSubmitting(true);
    try {
      // In a real app, you would upload the file to Supabase storage
      // For this demo, we'll use a mock URL
      const mockUrl = "#";
      const updatedProject = await updateProjectStep(id, selectedStep, {
        completed: true,
        documentUrl: mockUrl,
        documentName: uploadFile.name,
      });

      if (updatedProject) {
        setProject(updatedProject);
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setActiveDialog(null);
      setUploadFile(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!id || selectedStep === null) return;

    setIsSubmitting(true);
    try {
      const updatedProject = await deleteDocument(id, selectedStep);
      if (updatedProject) {
        setProject(updatedProject);
        toast({
          title: "Success",
          description: "Document removed successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setActiveDialog(null);
    }
  };

  const openDialog = (
    step: number,
    dialog: "upload" | "view" | "delete"
  ) => {
    setSelectedStep(step);
    setActiveDialog(dialog);
  };

  const getStepById = (stepId: number) => {
    return project?.steps.find((s) => s.stepId === stepId);
  };

  const getStepInfoById = (stepId: number) => {
    return PROGRESS_STEPS.find((s) => s.id === stepId);
  };

  if (isLoading) {
    return (
      <Layout
        title="Project Details"
        showBackButton
        onBack={() => navigate("/projects")}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout
        title="Project Details"
        showBackButton
        onBack={() => navigate("/projects")}
      >
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Project not found
          </h2>
          <p className="mt-2 text-gray-600">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/projects")} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Project Details"
      showBackButton
      onBack={() => navigate("/projects")}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-gray-600">{project.description}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Started: {project.createdAt}</span>
            </div>
            <div>
              <span className="font-medium">
                {project.steps.filter((s) => s.completed).length}
              </span>{" "}
              of{" "}
              <span className="font-medium">{project.steps.length}</span> steps
              completed
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Progress</span>
              <span className="text-blue-600">
                {Math.round(project.progress)}%
              </span>
            </CardTitle>
            <CardDescription>Project completion status</CardDescription>
            <Progress value={project.progress} className="h-2" />
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Steps</h2>
          {PROGRESS_STEPS.map((progressStep, index) => {
            const step = getStepById(progressStep.id);
            return (
              <Card
                key={progressStep.id}
                className={cn(
                  "border-l-4",
                  step?.completed
                    ? "border-l-green-500 bg-green-50"
                    : "border-l-gray-200"
                )}
              >
                <CardContent className="p-4">
                  <div className="md:flex justify-between items-center">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {step?.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          {index + 1}. {progressStep.title}{" "}
                          {step?.completed && (
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {progressStep.description}
                        </p>
                        {step?.documentName && (
                          <div className="mt-2 flex items-center text-sm text-blue-600">
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="truncate max-w-xs">
                              {step.documentName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-2 justify-end">
                      {step?.completed && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              openDialog(progressStep.id, "view")
                            }
                          >
                            <Download className="h-4 w-4 mr-1" /> View
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                openDialog(progressStep.id, "delete")
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          )}
                        </>
                      )}
                      {!step?.completed && isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => openDialog(progressStep.id, "upload")}
                        >
                          <Upload className="h-4 w-4 mr-1" /> Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Dialog */}
        <Dialog
          open={activeDialog === "upload"}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Upload Document for{" "}
                {getStepInfoById(selectedStep || 0)?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) =>
                    setUploadFile(e.target.files ? e.target.files[0] : null)
                  }
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadFile ? (
                    <>
                      <FileText className="h-12 w-12 text-blue-500" />
                      <span className="mt-2 text-sm font-medium text-gray-900">
                        {uploadFile.name}
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
                        {(uploadFile.size / 1024).toFixed(2)} KB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-semibold text-gray-700">
                        Click to upload a document
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, DOCX, JPG up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveDialog(null);
                  setUploadFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog
          open={activeDialog === "view"}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Document for {getStepInfoById(selectedStep || 0)?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium">
                      {
                        project.steps.find((s) => s.stepId === selectedStep)
                          ?.documentName
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded on{" "}
                      {
                        project.steps.find((s) => s.stepId === selectedStep)
                          ?.updatedAt
                      }
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
              <div className="mt-4 bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                <p>Document preview would appear here in a real application</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setActiveDialog(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Document Dialog */}
        <Dialog
          open={activeDialog === "delete"}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete this document for{" "}
                <span className="font-semibold">
                  {getStepInfoById(selectedStep || 0)?.title}
                </span>
                ?
              </p>
              <p className="mt-2 text-sm text-gray-500">
                This will remove the document and mark this step as incomplete.
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActiveDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDocument}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
