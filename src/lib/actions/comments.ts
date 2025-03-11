'use server';

import { createClient } from '@/lib/supabase/server';

type CommentActionResult = {
    success: boolean;
    comment?: object;
    comments?: object[];
    error?: string;
};


// ✅ Obter um único comentário pelo ID
export async function getComment(commentId: string): Promise<CommentActionResult> {
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

// ✅ Atualizar o status de um comentário
export async function updateCommentStatus(commentId: string, status: string): Promise<CommentActionResult> {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('comments')
            .update({ status })
            .eq('id', commentId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating comment status:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update comment status' };
    }
}

// ✅ Deletar um comentário
export async function deleteComment(commentId: string): Promise<CommentActionResult> {
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
export async function addCommentTag(commentId: string, tag: string): Promise<CommentActionResult> {
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
