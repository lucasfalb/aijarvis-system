'use server';

import { createClient } from '@/lib/supabase/server';

type LogActionResult = {
    success: boolean;
    log?: {
        id: string;
        user_id?: string;
        user_email?: string;
        action: string;
        entity?: string;
        entity_id?: string;
        old_value?: object;
        new_value?: object;
        timestamp: string;
    };
    logs?: Array<{
        id: string;
        user_id?: string;
        user_email?: string;
        action: string;
        entity?: string;
        entity_id?: string;
        old_value?: object;
        new_value?: object;
        timestamp: string;
    }>;
    error?: string;
};

// ✅ Criar um novo log de ação
export async function createLog(action: string, userId?: string, userEmail?: string, entity?: string, entityId?: string, oldValue?: object, newValue?: object): Promise<LogActionResult> {
    const supabase = await createClient();

    try {
        const { data: log, error } = await supabase
            .from('logs')
            .insert({
                user_id: userId || null,
                user_email: userEmail || null,
                action,
                entity: entity || null,
                entity_id: entityId || null,
                old_value: oldValue || null,
                new_value: newValue || null,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, log };
    } catch (error) {
        console.error('Error creating log:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create log' };
    }
}

// ✅ Buscar um log específico pelo ID
export async function getLog(logId: string): Promise<LogActionResult> {
    const supabase = await createClient();

    try {
        const { data: log, error } = await supabase
            .from('logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (error) throw error;

        return { success: true, log };
    } catch (error) {
        console.error('Error fetching log:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch log' };
    }
}

// ✅ Buscar logs de um usuário específico (por ID e email)
export async function getLogsByUser(userId: string, userEmail?: string): Promise<LogActionResult> {
    const supabase = await createClient();

    try {
        const query = supabase.from('logs').select('*').order('timestamp', { ascending: false });

        if (userEmail) {
            query.eq('user_email', userEmail);
        } else {
            query.eq('user_id', userId);
        }

        const { data: logs, error } = await query;

        if (error) throw error;

        return { success: true, logs };
    } catch (error) {
        console.error('Error fetching logs by user:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch logs by user' };
    }
}

// ✅ Buscar logs de uma entidade específica
export async function getLogsByEntity(entity: string, entityId: string): Promise<LogActionResult> {
    const supabase = await createClient();

    try {
        const { data: logs, error } = await supabase
            .from('logs')
            .select('*')
            .eq('entity', entity)
            .eq('entity_id', entityId)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        return { success: true, logs };
    } catch (error) {
        console.error('Error fetching logs by entity:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch logs by entity' };
    }
}

// ✅ Buscar os logs mais recentes
export async function getRecentLogs(limit: number = 10): Promise<LogActionResult> {
    const supabase = await createClient();

    try {
        const { data: logs, error } = await supabase
            .from('logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { success: true, logs };
    } catch (error) {
        console.error('Error fetching recent logs:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch recent logs' };
    }
}
