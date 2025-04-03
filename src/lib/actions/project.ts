'use server';
import { addProjectFiles } from "./files";

import { createClient } from '@/lib/supabase/server';
type ProjectActionResult = {
  success: boolean;
  project?: { id: string; name: string; description?: string };
  error?: string;
};

// ✅ Get a single project by ID (must have access)
export async function getProject(projectId: string) {
  const supabase = await createClient();

  try {
    // ✅ Obtém o usuário autenticado
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to view this project");

    const user = userData.user;

    // ✅ Verifica se o usuário tem acesso ao projeto
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject) {
      throw new Error("You do not have permission to access this project.");
    }

    // ✅ Busca os detalhes do projeto, incluindo `updated_at`
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, created_at, updated_at') // Agora inclui `updated_at`
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    return { success: true, project, role: userProject.role };
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch project" };
  }
}

// ✅ Create a new project
export async function createProject(formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to create a project");

    const user = userData.user;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    const files: File[] = formData.getAll('files').filter((file): file is File => file instanceof File);

    // ✅ Inserir projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({ name, description })
      .select()
      .single();

    if (projectError) throw projectError;

    // ✅ Atribuir usuário como admin
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

    // ✅ Enviar arquivos se houver
    if (files.length > 0) {
      const uploadResult = await addProjectFiles(project.id, files);

      if (!uploadResult.success) {
        // Rollback total se falhar o envio dos arquivos
        await supabase.from('user_projects').delete().eq('project_id', project.id);
        await supabase.from('projects').delete().eq('id', project.id);
        throw new Error(uploadResult.error || 'Failed to upload files');
      }
    }

    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    };
  }
}

// ✅ Update an existing project
export async function updateProject(projectId: string, formData: FormData): Promise<ProjectActionResult> {
  const supabase = await createClient();

  try {
    // ✅ Obtém o usuário autenticado
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in to update a project");

    const user = userData.user;

    // ✅ Verifica se o usuário tem permissão de admin no projeto
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("You do not have permission to update this project.");
    }

    // ✅ Se houver arquivos, tenta fazer upload primeiro
    const files: File[] = formData.getAll('files').filter((file): file is File => file instanceof File);
    if (files.length > 0) {
      const uploadResult = await addProjectFiles(projectId, files);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload project files");
      }
    }

    // ✅ Agora atualiza o projeto
    const { data, error: updateError } = await supabase
      .from('projects')
      .update({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select('id, name, description, updated_at')
      .single();

    if (updateError) throw updateError;

    return { success: true, project: data };
  } catch (error) {
    console.error("❌ Error updating project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
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

    // Remover projeto e dependências
    await supabase.from('user_projects').delete().eq('project_id', projectId);
    const { error: projectError } = await supabase.from('projects').delete().eq('id', projectId);

    if (projectError) throw projectError;

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
    const { data: members, error } = await supabase.rpc("get_project_members", { p_project_id: projectId });

    if (error) throw error;

    return { success: true, members };
  } catch (error) {
    console.error("❌ Error fetching members:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch members" };
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
    role = role.toLowerCase();

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

    if (rpcError || !users || users.length === 0 || !users[0].id) {
      throw new Error("User does not exist. They must sign up first.");
    }

    const existingUser = users[0];

    // ✅ Ensure `project_id` exists
    const { data: projectExists, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !projectExists) {
      throw new Error("Project does not exist.");
    }

    // ✅ Check if user is already part of the project
    const { data: existingMember } = await supabase
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

    if (assignError) throw new Error("Failed to add user to project. Check constraints.");

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

    const user = userData.user;

    // ✅ Verifica se o usuário atual é admin
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("Only admins can remove members.");
    }

    // ✅ Verifica o papel do usuário que está sendo removido
    const { data: targetUserProject, error: targetRoleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (targetRoleError || !targetUserProject) {
      throw new Error("User not found in project.");
    }

    // ✅ Conta quantos admins existem no projeto
    const { count: totalAdmins, error: adminError } = await supabase
      .from('user_projects')
      .select('user_id', { count: 'exact' }) // Conta corretamente os admins
      .eq('project_id', projectId)
      .eq('role', 'admin');

    if (adminError) throw adminError;

    const adminCount = totalAdmins ?? 0; // Garante que nunca será null

    // ✅ Impede a remoção do último admin
    if (targetUserProject.role === 'admin' && adminCount <= 1) {
      throw new Error("You cannot remove the last admin. The project must have at least one admin.");
    }

    // ✅ Remove o usuário do projeto
    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove member' };
  }
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  newRole: 'viewer' | 'editor' | 'admin'
) {
  const supabase = await createClient();

  try {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) throw new Error("Please sign in");

    const user = userData.user;

    // Verifica se o usuário atual é admin no projeto
    const { data: userProject, error: roleError } = await supabase
      .from('user_projects')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (roleError || !userProject || userProject.role !== 'admin') {
      throw new Error("Only admins can update member roles");
    }

    // Conta quantos admins existem no projeto
    const { count, error: adminError } = await supabase
      .from('user_projects')
      .select('user_id', { count: 'exact' }) // Contando corretamente os admins
      .eq('project_id', projectId)
      .eq('role', 'admin');

    if (adminError) throw adminError;

    const totalAdmins = count ?? 0; // Garantindo que nunca será null

    // Impede a remoção do último admin
    if (userId === user.id && userProject.role === 'admin' && newRole !== 'admin' && totalAdmins <= 1) {
      throw new Error("You cannot remove yourself as admin. The project must have at least one admin.");
    }

    // Atualiza o cargo do membro
    const { error } = await supabase
      .from('user_projects')
      .update({ role: newRole })
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' };
  }
}
