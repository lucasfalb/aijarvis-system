import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Monitor } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Monitors",
}

export default async function MonitorsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select(`
      *,
      projects (
        id,
        name,
        description
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching monitors:', error)
    return <div>Error loading monitors</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Monitors</h1>
        <Link href="/app/monitors/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Monitor
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {monitors?.map((monitor) => (
          <div key={monitor.id} className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{monitor.name}</h2>
            <p className="text-gray-600">{monitor.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}