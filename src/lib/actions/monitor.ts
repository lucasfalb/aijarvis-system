'use server';

import { createClient } from '@/lib/supabase/server';

export interface Monitor {
    id: string;
    account_name: string;
    access_token: string;
    project_id: string;
    created_at: string;
    updated_at: string;
    platform: string;
    webhook_receive: string;
    webhook_send?: string;
    status?: string;
}

type MonitorActionResult = {
    success: boolean;
    monitor?: Monitor;
    monitors?: Monitor[];
    error?: string;
};


// 🔧 Função auxiliar para gerar um webhook_receive dinâmico
const generateWebhookReceive = (monitorId: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/webhook/${monitorId}`;

// 🔧 Webhook Sender (fixo em nossa API)
const WEBHOOK_SENDER = `${process.env.NEXT_PUBLIC_WEBHOOK_N8N_RESPONSE}`;

// ✅ Criar um novo monitor
export async function createMonitor(formData: FormData): Promise<MonitorActionResult> {
    const supabase = await createClient();
    console.log(WEBHOOK_SENDER)
    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Error - create a monitor');

        const user = userData.user;
        const account_name = String(formData.get('name'));
        const access_token = String(formData.get('access_token'));
        const project_id = String(formData.get('project_id'));
        const platform = String(formData.get('platform'));

        if (!account_name || !access_token || !project_id || !platform) {
            throw new Error('All required fields must be filled.');
        }

        // ✅ Verificar se o usuário é admin do projeto
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can create monitors.');
        }

        // ✅ Criar monitor sem webhook_receive ainda
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .insert({
                account_name,
                access_token,
                project_id,
                platform,
                webhook_receive: '', // Inicialmente vazio
                webhook_send: WEBHOOK_SENDER, // Webhook de saída fixo
            })
            .select()
            .single();

        if (monitorError) throw monitorError;

        // ✅ Atualizar monitor com o webhook_receive gerado
        const webhook_receive = generateWebhookReceive(monitor.id);
        const { error: updateError } = await supabase
            .from('monitors')
            .update({ webhook_receive })
            .eq('id', monitor.id);

        if (updateError) throw updateError;

        return { success: true, monitor: { ...monitor, webhook_receive } };
    } catch (error) {
        console.error('Error creating monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create monitor' };
    }
}

// ✅ Atualizar um monitor
export async function updateMonitor(monitorId: string, formData: FormData): Promise<MonitorActionResult> {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to update monitor');

        const user = userData.user;
        
        // ✅ Buscar monitor existente
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('*')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;

        // ✅ Verificar se o usuário é admin do projeto
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', monitor.project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can update monitors.');
        }

        // ✅ Atualizar monitor
        const updates: Partial<Monitor> = {
            account_name: formData.get('name') ? String(formData.get('name')) : undefined,
            access_token: formData.get('access_token') ? String(formData.get('access_token')) : undefined,
            platform: formData.get('platform') ? String(formData.get('platform')) : undefined,
            webhook_receive: formData.get('webhook_receive') ? String(formData.get('webhook_receive')) : undefined,
            webhook_send: formData.get('webhook_send') ? String(formData.get('webhook_send')) : undefined,
            updated_at: new Date().toISOString(),
        };

        // Remove undefined values
        Object.keys(updates).forEach(key => 
            updates[key as keyof Partial<Monitor>] === undefined && delete updates[key as keyof Partial<Monitor>]
        );

        const { data: updatedMonitor, error: updateError } = await supabase
            .from('monitors')
            .update(updates)
            .eq('id', monitorId)
            .select()
            .single();

        if (updateError) throw updateError;
        return { success: true, monitor: updatedMonitor as Monitor };
    } catch (error) {
        console.error('Error updating monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update monitor' };
    }
}

// ✅ Deletar um monitor
export async function deleteMonitor(monitorId: string): Promise<MonitorActionResult> {
    const supabase = await createClient();

    try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user) throw new Error('Please sign in to delete monitor');

        const user = userData.user;

        // ✅ Buscar monitor existente
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('project_id')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;

        // ✅ Verificar se o usuário é admin do projeto
        const { data: userProject, error: accessError } = await supabase
            .from('user_projects')
            .select('role')
            .eq('user_id', user.id)
            .eq('project_id', monitor.project_id)
            .single();

        if (accessError || !userProject || userProject.role !== 'admin') {
            throw new Error('Only admins can delete monitors.');
        }

        // ✅ Excluir monitor
        const { error: deleteError } = await supabase.from('monitors').delete().eq('id', monitorId);

        if (deleteError) throw deleteError;

        return { success: true };
    } catch (error) {
        console.error('Error deleting monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete monitor' };
    }
}

// ✅ Buscar um monitor específico
export async function getMonitor(monitorId: string): Promise<MonitorActionResult> {
    const supabase = await createClient();

    try {
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('*')
            .eq('id', monitorId)
            .single();

        if (monitorError) throw monitorError;
        return { success: true, monitor: monitor as Monitor };
    } catch (error) {
        console.error('Error fetching monitor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch monitor' };
    }
}

// ✅ Buscar todos os monitores de um projeto
export async function getMonitors(projectId: string): Promise<MonitorActionResult> {
    const supabase = await createClient();

    try {
        const { data: monitors, error: monitorsError } = await supabase
            .from('monitors')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (monitorsError) throw monitorsError;

        return { success: true, monitors: monitors as Monitor[] };
    } catch (error) {
        console.error('Error fetching monitors:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch monitors' };
    }
}
