'use server';

import { createClient } from '@/lib/supabase/server';

type CommentActionResult = {
    success: boolean;
    comment?: object;
    comments?: object[];
    error?: string;
};

// ✅ Obter um único comentário pelo ID
export async function getComment(commentId: number): Promise<CommentActionResult> {
    const supabase = await createClient();

    try {
        const { data: comment, error } = await supabase
            .from('comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (error) throw error;

        return { success: true, comment };
    } catch (error) {
        console.error('Error fetching comment:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch comment' };
    }
}

// ✅ Obter todos os comentários de um monitor
export async function getComments(monitorId: string): Promise<CommentActionResult> {
    const supabase = await createClient();

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('monitor_id', monitorId)
            .order('received_at', { ascending: false });

        if (error) throw error;

        return { success: true, comments };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch comments' };
    }
}

// ✅ Atualizar o status de um comentário e enviar resposta ao webhook
export async function updateCommentStatus(
    commentId: string,
    replyText: string
): Promise<CommentActionResult> {
    const supabase = await createClient();
    const WEBHOOK_SENDER = `${process.env.NEXT_PUBLIC_WEBHOOK_N8N_RESPONSE}`;

    try {
        // Get the current user from the server session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Get comment details
        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .select('id, text, username, media_id, monitor_id')
            .eq('id', commentId)
            .single();

        if (commentError || !comment) {
            throw new Error("Comment not found");
        }

        // Get monitor details including access_token
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('id, account_name, platform, webhook_send, access_token')
            .eq('id', comment.monitor_id)
            .single();

        if (monitorError || !monitor) {
            throw new Error("Monitor not found");
        }

        if (!monitor.access_token) {
            throw new Error("Monitor access token not found");
        }

        // Get additional user profile information if needed
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

        const payload = {
            methodResponse: 'reply',
            commentId: comment.id,
            originalText: comment.text,
            repliedText: replyText,
            username: comment.username,
            mediaId: comment.media_id,
            monitor: {
                id: monitor.id,
                account_name: monitor.account_name,
                platform: monitor.platform,
                access_token: monitor.access_token
            },
            user: {
                id: user.id,
                email: user.email,
                name: profile?.full_name || user.email?.split('@')[0] || 'Unknown User',
                avatar: profile?.avatar_url
            }
        };

        // ✅ Enviar resposta ao webhook
        const response = await fetch(WEBHOOK_SENDER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Webhook request failed with status: ${response.status}`);
        }

        // ✅ Atualizar status do comentário somente se o POST retornar 200
        const { error: updateError } = await supabase
            .from('comments')
            .update({ 
                status: 'responded',
                generate_response: replyText,
            })
            .eq('id', commentId);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        console.error('Error updating comment status:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update comment status' };
    }
}


// ✅ Deletar um comentário
export async function deleteComment(commentId: number): Promise<CommentActionResult> {
    const supabase = await createClient();

    try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete comment' };
    }
}

// ✅ Adicionar tags a um comentário
export async function addCommentTag(commentId: number, tag: string): Promise<CommentActionResult> {
    const supabase = await createClient();

    try {
        const { data: newTag, error } = await supabase
            .from('comment_tags')
            .insert({ comment_id: commentId, tag })
            .select()
            .single();

        if (error) throw error;

        return { success: true, comment: newTag };
    } catch (error) {
        console.error('Error adding tag to comment:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add tag' };
    }
}
