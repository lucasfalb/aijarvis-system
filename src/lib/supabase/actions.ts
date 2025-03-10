'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project, UserProject, Monitor, Comment, Response, Log } from '@/lib/types/database'

// Get user projects
export async function getUserProjects(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_projects')
    .select(`
      projects (*),
      role
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Error fetching user projects: ${error.message}`)
  return data
}

// Get project monitors
export async function getProjectMonitors(projectId: string, status?: Monitor['status']) {
  const supabase = await createClient()
  let query = supabase
    .from('monitors')
    .select(`
      *,
      webhooks (id)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`Error fetching project monitors: ${error.message}`)
  return data
}

// Get comments for a monitor
export async function getMonitorComments(
  monitorId: string,
  filters?: {
    status?: Comment['status']
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  let query = supabase
    .from('comments')
    .select(`
      *,
      comment_tags (tag),
      responses (id)
    `)
    .eq('monitor_id', monitorId)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(`Error fetching monitor comments: ${error.message}`)
  return { data, count }
}

// Create a project and assign a user
export async function createProjectWithUser(
  projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
  userId: string
) {
  const supabase = await createClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  if (projectError) throw new Error(`Error creating project: ${projectError.message}`)

  const { error: userProjectError } = await supabase
    .from('user_projects')
    .insert({
      user_id: userId,
      project_id: project.id,
      role: 'owner'
    })

  if (userProjectError) {
    await supabase.from('projects').delete().eq('id', project.id)
    throw new Error(`Error assigning project to user: ${userProjectError.message}`)
  }

  revalidatePath('/app/projects')
  return project
}

// Update comment status and log the action
export async function updateCommentStatus(
  commentId: string,
  status: Comment['status'],
  userId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', commentId)

  if (error) throw new Error(`Error updating comment status: ${error.message}`)

  await supabase
    .from('logs')
    .insert({
      user_id: userId,
      action: 'update_comment_status',
      details: JSON.stringify({ comment_id: commentId, status })
    })

  revalidatePath('/app/comments')
  return true
}
