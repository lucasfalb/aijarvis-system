"use server";


export async function getProjectFiles(projectId: string) {
  try {
    const WEBHOOK_SENDER = process.env.NEXT_PUBLIC_WEBHOOK_N8N_RESPONSE;
    if (!WEBHOOK_SENDER) {
      return { success: false, error: "Webhook URL not configured" };
    }

    const webhookFormData = new FormData();
    webhookFormData.append('projectId', projectId);
    webhookFormData.append('route_flow', 'get_project_files');

    const response = await fetch(WEBHOOK_SENDER, {
      method: 'POST',
      body: webhookFormData,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Project files data:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching project files:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch project files"
    };
  }
}
export async function addProjectFiles(projectId: string, files: File[]) {
  try {
    const WEBHOOK_SENDER = process.env.NEXT_PUBLIC_WEBHOOK_N8N_RESPONSE;
    if (!WEBHOOK_SENDER) {
      return { success: false, error: "Webhook upload URL not configured" };
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("route_flow", "add_project_file");

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(WEBHOOK_SENDER, {
      method: "POST",
      body: formData,
    });
    console.log("Response from upload:", response);
    if (!response.ok) {
      throw new Error(`Failed to upload files: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Upload response data:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error uploading files:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload files",
    };
  }
}
export async function deleteProjectFile(projectId: string, fileId: string) {
  try {
    const WEBHOOK_SENDER = process.env.NEXT_PUBLIC_WEBHOOK_N8N_RESPONSE;
    if (!WEBHOOK_SENDER) {
      return { success: false, error: "Webhook URL not configured" };
    }

    const webhookFormData = new FormData();
    webhookFormData.append('projectId', projectId);
    webhookFormData.append('fileId', fileId);
    webhookFormData.append('route_flow', 'delete_file');

    const response = await fetch(WEBHOOK_SENDER, {
      method: 'POST',
      body: webhookFormData,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project file: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting project file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project file"
    };
  }
}
