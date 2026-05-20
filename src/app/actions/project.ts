"use server";

import { getProject, deleteProject } from "@/lib/firebase";
import { deleteImagesFromCloudinary } from "@/app/actions/theme";

export async function deleteProjectWithAssets(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const project = await getProject(projectId);
    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.photos && project.photos.length > 0) {
      const urls = project.photos.map((p) => p.url);
      const cloudinaryDeleted = await deleteImagesFromCloudinary(urls);
      if (!cloudinaryDeleted) {
        console.warn(`Cloudinary cleanup failed or skipped for project ${projectId}`);
      }
    }

    await deleteProject(projectId);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project with assets:", error);
    return { success: false, error: error?.message || "Internal server error" };
  }
}
