import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Response } from "@/lib/types/database"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"

export const metadata: Metadata = {
  title: "Responses",
}

export default async function ResponsesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: responses, error } = await supabase
    .from('responses')
    .select(`
      *,
      comments (
        id,
        text,
        username
      ),
      users:reviewed_by (
        id,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching responses:', error)
    return <div>Error loading responses</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Responses</h1>
      </div>

      <DataTable columns={columns} data={responses || []} />
    </div>
  )
}