'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createLog } from './logs';

type MonitorActionResult = {
    success: boolean;
    monitor?: { id: string; account_name: string; access_token: string; project_id: string; platform: string; webhook: string };
    error?: string;
};

// ✅ Create a new monitor (only admins of the project can create)
export async function createMonitor(formData: FormData): Promise<MonitorActionResult> {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to create a monitor');

        const user = userData.user;
        const account_name = String(formData.get('name'));
        const access_token = String(formData.get('access_token'));
        const project_id = String(formData.get('project_id'));
        const platform = String(formData.get('platform'));
        const webhook = String(formData.get('webhook'));

        if (!account_name || !access_token || !project_id || !platform || !webhook) {
            throw new Error('All fields (name, access_token, project_id, platform, webhook) are required.');
        }

        // ✅ Ensure the user is an admin of the project
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can create monitors.');
        }

        // ✅ Insert the new monitor
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .insert({
                account_name,
                access_token,
                project_id,
                platform,
                webhook,
            })
            .select()
            .single();

        if (monitorError) throw monitorError;

        // In createMonitor, update the log call:
        // ✅ Log the creation
        await createLog(
            'CREATE_MONITOR',
            user.id,
            user.email,
            'monitor',
            monitor.id,
            undefined,
            { account_name, platform, project_id, webhook }
        );

        revalidatePath(`/app/projects/${project_id}/monitors`);
        return { success: true, monitor };
    } catch (error) {
        console.error('Error creating monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create monitor' };
    }
}

// ✅ Update a monitor (only admins of the project can update)
export async function updateMonitor(monitorId: string, formData: FormData) {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to update monitor');

        const user = userData.user;
        const account_name = formData.get('name') ? String(formData.get('name')) : undefined;
        const access_token = formData.get('access_token') ? String(formData.get('access_token')) : undefined;
        const platform = formData.get('platform') ? String(formData.get('platform')) : undefined;
        const webhook = formData.get('webhook') ? String(formData.get('webhook')) : undefined;

        // ✅ Get monitor to check project ID
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('*')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;

        // ✅ Ensure user is an admin of the project
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', monitor.project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can update monitors.');
        }

        // ✅ Perform update
        const { error: updateError } = await supabase
            .from('monitors')
            .update({
                account_name,
                access_token,
                platform,
                webhook,
                updated_at: new Date(),
            })
            .eq('id', monitorId);

        if (updateError) throw updateError;

        // In updateMonitor, update the log call:
        // ✅ Log the update
        await createLog(
            'UPDATE_MONITOR',
            user.id,
            user.email,
            'monitor',
            monitorId,
            monitor,
            { account_name, platform, webhook, updated_at: new Date() }
        );

        revalidatePath(`/app/monitors/${monitorId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update monitor' };
    }
}

// ✅ Delete a monitor (only admins of the project can delete)
export async function deleteMonitor(monitorId: string) {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to delete monitor');

        const user = userData.user;

        // ✅ Get monitor to check project ID
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('project_id')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;

        // ✅ Ensure user is an admin of the project
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', monitor.project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can delete monitors.');
        }

        // ✅ Perform delete
        const { error: deleteError } = await supabase.from('monitors').delete().eq('id', monitorId);

        if (deleteError) throw deleteError;

        // In deleteMonitor, update the log call:
        // ✅ Log the deletion
        await createLog(
            'DELETE_MONITOR',
            user.id,
            user.email,
            'monitor',
            monitorId,
            { id: monitorId, project_id: monitor.project_id },
            undefined
        );

        revalidatePath(`/app/projects/${monitor.project_id}/monitors`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete monitor' };
    }
}

// ✅ Get a single monitor by ID (must have access)
export async function getMonitor(monitorId: string) {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to view monitor');

        const user = userData.user;

        // ✅ Fetch monitor
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('*')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;
        // In getMonitor, update the log call:
        // ✅ Log the read action
        await createLog(
            'READ_MONITOR',
            user.id,
            user.email,
            'monitor',
            monitor.id,
            undefined,
            undefined
        );

        return { success: true, monitor };
    } catch (error) {
        console.error('Error fetching monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch monitor' };
    }
}

// ✅ Get all monitors for a specific project
export async function getMonitors(projectId: string) {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to view monitors');

        const user = userData.user;

        // ✅ Ensure user has access to the project
        const { data: userProject, error: projectAccessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', projectId)
            .single();

        if (projectAccessError || !userProject) {
            throw new Error('Access denied');
        }

        // ✅ Fetch all monitors for the specified project
        const { data: monitors, error: monitorsError } = await supabase
            .from('monitors')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (monitorsError) throw monitorsError;

        // In getMonitors, update the log call:
        // ✅ Log the read action
        await createLog(
            'READ_MONITORS',
            user.id,
            user.email,
            'project',
            projectId,
            undefined,
            undefined
        );

        return { success: true, monitors };
    } catch (error) {
        console.error('Error fetching monitors:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch monitors' };
    }
}
