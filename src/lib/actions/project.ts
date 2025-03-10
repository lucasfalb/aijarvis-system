'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type ProjectActionResult = {
  success: boolean;
  project?: { id: string; name: string; description?: string };
  error?: string;
}

export async function createProject(formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // ✅ Get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      throw new Error("Please sign in to create a project");
    }

    const user = userData.user;

    // ✅ Insert new project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // ✅ Assign user as "admin" in `user_projects`
    const { error: userProjectError } = await supabase
      .from('user_projects')
      .insert({
        user_id: user.id,
        project_id: project.id,
        role: 'admin', // Owner is always assigned as "admin"
      });

    if (userProjectError) {
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error('Failed to assign user role.');
    }

    revalidatePath('/app/projects');
    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

export async function updateProject(projectId: string, formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // ✅ Get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      throw new Error("Please sign in to update a project");
    }

    const user = userData.user;

    // ✅ Check if the user is an "admin" for this project
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("You do not have permission to update this project.");
    }

    // ✅ Update the project
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
      .eq('id', projectId);

    if (updateError) throw updateError;

    revalidatePath('/app/projects');
    return { success: true, project: { id: projectId, name: formData.get('name') as string, description: formData.get('description') as string } };
  } catch (error) {
    console.error('Error updating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    };
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  try {
    // ✅ Get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      throw new Error("Please sign in to delete a project");
    }

    const user = userData.user;

    // ✅ Check if the user is an "admin" for this project
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("You do not have permission to delete this project.");
    }

    // ✅ Delete all associated `user_projects` records first (to avoid foreign key issues)
    const { error: userProjectsError } = await supabase
      .from('user_projects')
      .delete()
      .eq('project_id', projectId);

    if (userProjectsError) throw new Error("Failed to remove project relationships.");

    // ✅ Delete the project
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (projectError) throw projectError;

    revalidatePath('/app/projects');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project',
    };
  }
}
