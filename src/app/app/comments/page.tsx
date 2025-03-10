import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Comment } from "@/lib/types/database"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"

export const metadata: Metadata = {
  title: "Comments",
}

export default async function CommentsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      comment_tags (
        tag
      ),
      monitors (
        id,
        platform,
        account_name
      ),
      webhooks (
        id,
        webhook_type
      )
    `)
    .order('received_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return <div>Error loading comments</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Comments</h1>
      </div>

      <DataTable columns={columns} data={comments || []} />
    </div>
  )
}