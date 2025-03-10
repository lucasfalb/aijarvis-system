import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Log } from "@/lib/types/database"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"

export const metadata: Metadata = {
  title: "Logs",
}

export default async function LogsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: logs, error } = await supabase
    .from('logs')
    .select(`
      *,
      users:user_id (
        id,
        email
      )
    `)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching logs:', error)
    return <div>Error loading logs</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">System Logs</h1>
      </div>

      <DataTable columns={columns} data={logs || []} />
    </div>
  )
}