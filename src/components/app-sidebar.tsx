"use client"
import * as React from "react"
import { useEffect, useState } from "react"
import { getUserInfoClient } from "@/lib/actions/user-client"
import {
  BotIcon,
  Frame,
} from "lucide-react"

import { Nav } from "@/components/nav-links"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Logo } from "./logo"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

// This is sample data.
const data = {
  projects: [
    {
      name: "Projects",
      url: "/app/projects",
      icon: Frame,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
  })

  useEffect(() => {
    async function loadUserData() {
      const user = await getUserInfoClient()

      if (user) {
        setUserData({
          name: user.fullName || user.email?.split('@')[0] || '',
          email: user.email || '',
          avatar: user.avatar || '',
        })
      }
    }

    loadUserData()
  }, [])

  return (
    <Sidebar className="absolute" collapsible="icon" {...props}>
      <SidebarHeader className={`${state === "collapsed" ? "mx-auto flex p-2" : "p-4"} overflow-hidden`} >
        <BotIcon className={`${state === "collapsed" ? "mx-auto flex" : "hidden"}`} />
        <Link href="/app">
          <Logo className={`w-42 h-fit ${state === "collapsed" ? "hidden" : "block"}`} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <Nav projects={data.projects} />
        <div className={`${state === "collapsed" ? "flex-col p-1" : "flex-row px-3"} "ml-auto mt-auto flex justify-between gap-5 w-full overflow-hidden`}>
          <ModeToggle />
          <SidebarTrigger />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t mt-2">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
