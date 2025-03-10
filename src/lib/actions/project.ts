'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type ProjectActionResult = {
  success: boolean;
  project?: { id: string; name: string; description?: string };
  error?: string;
};

// ✅ Create a new project
export async function createProject(formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to create a project");

    const user = userData.user;

    // ✅ Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // ✅ Assign user as "admin"
    const { error: userProjectError } = await supabase
      .from('user_projects')
      .insert({
        user_id: user.id,
        project_id: project.id,
        role: 'admin',
      });

    if (userProjectError) {
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error('Failed to assign user role.');
    }

    revalidatePath('/app/projects');
    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create project' };
  }
}

// ✅ Update an existing project
export async function updateProject(projectId: string, formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to update a project");

    const user = userData.user;

    // ✅ Check if user is admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("You do not have permission to update this project.");
    }

    // ✅ Update project
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
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update project' };
  }
}


// ✅ Get all projects that the user has access to
export async function getProjects() {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to view projects");

    const user = userData.user;

    // ✅ Get all projects where the user has access
    const { data: userProjects, error: userProjectsError } = await supabase
      .from('user_projects')
      .select('projects (id, name, description, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { foreignTable: 'projects', ascending: false });

    if (userProjectsError) throw userProjectsError;

    const projects = userProjects?.map((up) => up.projects).filter(Boolean) || [];
    return { success: true, projects };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch projects' };
  }
}
// ✅ Delete a project
export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to delete a project");

    const user = userData.user;

    // ✅ Check if user is admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("You do not have permission to delete this project.");
    }

    // ✅ Delete user_projects first to prevent foreign key errors
    await supabase.from('user_projects').delete().eq('project_id', projectId);

    // ✅ Delete project
    const { error: projectError } = await supabase.from('projects').delete().eq('id', projectId);

    if (projectError) throw projectError;

    revalidatePath('/app/projects');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' };
  }
}
// ✅ Fetch project members using the RPC function
export async function getProjectMembers(projectId: string) {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("User not authenticated");

    // ✅ Call the RPC function to get project members
    const { data: members, error } = await supabase
      .rpc("get_project_members", { p_project_id: projectId });

    if (error) throw error;

    return { success: true, members };
  } catch (error) {
    console.error("❌ Error fetching members:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch members",
    };
  }
}


// ✅ Allowed roles in the database (matches the constraint)
const ALLOWED_ROLES = ['admin', 'moderator', 'viewer'];

// ✅ Share a project with another user (Add to `user_projects`)
export async function shareProject(projectId: string, email: string, role: string) {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to share a project");

    const user = userData.user;

    // ✅ Convert role to lowercase to avoid case sensitivity issues
    role = role.toLowerCase();

    // ✅ Check if role is valid
    if (!ALLOWED_ROLES.includes(role)) {
      throw new Error(`Invalid role "${role}". Allowed roles: ${ALLOWED_ROLES.join(', ')}`);
    }

    // ✅ Check if the current user is an admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("Only admins can share projects.");
    }

    // ✅ Fetch user from the RPC function
    const { data: users, error: rpcError } = await supabase.rpc("get_user_by_email", { email_input: email });

    // ✅ Ensure users array is properly structured
    if (rpcError || !users || users.length === 0 || !users[0].id) {
      throw new Error("User does not exist. They must sign up first.");
    }

    const existingUser = users[0]; // ✅ Safe extraction

    // ✅ Ensure `project_id` exists in the `projects` table
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !projectExists) {
      throw new Error("Project does not exist.");
    }

    // ✅ Check if user is already part of the project
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('user_projects')
      .select('user_id')
      .eq('user_id', existingUser.id)
      .eq('project_id', projectId)
      .single();

    if (existingMember) {
      return { success: false, error: "User is already a member of this project." };
    }

    // ✅ Add the user to `user_projects`
    const { error: assignError } = await supabase
      .from('user_projects')
      .insert({
        user_id: existingUser.id,
        project_id: projectId,
        role,
      });

    if (assignError) {
      console.error("❌ Error inserting user into project:", assignError);
      throw new Error("Failed to add user to project. Check constraints.");
    }

    revalidatePath('/app/projects');
    return { success: true, message: "User added to project successfully." };
  } catch (error) {
    console.error("❌ Error sharing project:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to share project" };
  }
}


// ✅ Remove a project member (Only Admins can remove members)
export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("User not authenticated");

    const currentUserId = userData.user.id;

    // ✅ Check if the current user is an admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', currentUserId)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("Only admins can remove members.");
    }

    // ✅ Prevent removing the last admin
    const { data: adminCount, error: adminCheckError } = await supabase
      .from('user_projects')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('role', 'admin');

    if (adminCheckError) throw adminCheckError;

    if (adminCount.length === 1 && adminCount[0].user_id === userId) {
      throw new Error("Cannot remove the last admin.");
    }

    // ✅ Remove the user from the project
    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/app/projects');
    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove member',
    };
  }
}


export async function updateMemberRole(projectId: string, userId: string, newRole: 'viewer' | 'editor' | 'admin') {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in");

    // Check if current user is admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("Only admins can update member roles");
    }

    // Update member role
    const { error } = await supabase
      .from('user_projects')
      .update({ role: newRole })
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/app/projects');
    return { success: true };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' };
  }
}