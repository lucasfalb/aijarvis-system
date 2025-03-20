'use server';

import { createClient } from '@/lib/supabase/server';

type ResponseActionResult = {
    success: boolean;
    response?: object;
    responses?: object[];
    error?: string;
};

type UserInfo = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
};

// ✅ Função auxiliar para obter informações do usuário autenticado
async function getUserInfo(): Promise<UserInfo | null> {
    const supabase = await createClient();
    try {
        // ✅ Obtém usuário autenticado do Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("❌ User not authenticated");
            return null;
        }

        // ✅ Retorna as informações do usuário sem acessar `profiles`
        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
        };
    } catch (error) {
        console.error('❌ Error fetching user info:', error);
        return null;
    }
}

// ✅ Obter a resposta associada a um comentário
export async function getResponse(commentId: string): Promise<ResponseActionResult> {
    const supabase = await createClient();

    try {
        // Buscar a resposta
        const { data: response, error } = await supabase
            .from('responses')
            .select('*')
            .eq('comment_id', commentId)
            .order('reviewed_at', { ascending: false }) // Pega a mais recente primeiro
            .single();

        if (error || !response) throw error;

        // Buscar informações do usuário autenticado
        const userInfo = await getUserInfo();

        return { success: true, response: { ...response, user: userInfo } };
    } catch (error) {
        console.error('Error fetching response:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch response' };
    }
}

// ✅ Obter todas as respostas enviadas pelo usuário autenticado
export async function getResponsesFromUser(): Promise<ResponseActionResult> {
    const supabase = await createClient();

    try {
        // Buscar informações do usuário autenticado
        const userInfo = await getUserInfo();
        if (!userInfo) throw new Error("User not authenticated");

        // Buscar respostas do usuário autenticado
        const { data: responses, error } = await supabase
            .from('responses')
            .select('*')
            .eq('reviewed_by', userInfo.id)
            .order('reviewed_at', { ascending: false });

        if (error || !responses) throw error;

        // Adicionar info do usuário a cada resposta
        const responsesWithUser = responses.map(response => ({
            ...response,
            user: userInfo
        }));

        return { success: true, responses: responsesWithUser };
    } catch (error) {
        console.error('Error fetching user responses:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch user responses' };
    }
}

// ✅ Criar uma nova resposta para um comentário
export async function createResponse(commentId: string, responseText: string): Promise<ResponseActionResult> {
    const supabase = await createClient();

    try {
        // Obter informações do usuário autenticado
        const userInfo = await getUserInfo();
        if (!userInfo) throw new Error("User not authenticated");

        // Criar a resposta
        const { data: newResponse, error } = await supabase
            .from('responses')
            .insert({
                comment_id: commentId,
                response: responseText,
                reviewed_by: userInfo.id,
                reviewed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, response: { ...newResponse, user: userInfo } };
    } catch (error) {
        console.error('Error creating response:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create response' };
    }
}

// ✅ Atualizar uma resposta existente
export async function updateResponse(responseId: string, newResponseText: string): Promise<ResponseActionResult> {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('responses')
            .update({ response: newResponseText, reviewed_at: new Date().toISOString() })
            .eq('id', responseId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating response:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update response' };
    }
}

// ✅ Deletar uma resposta
export async function deleteResponse(responseId: string): Promise<ResponseActionResult> {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('responses')
            .delete()
            .eq('id', responseId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting response:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete response' };
    }
}