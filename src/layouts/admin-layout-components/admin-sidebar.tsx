"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Newspaper,
  Settings,
  Shield,
  Users,
} from "lucide-react"

import { NavMain, type NavItem } from "@/layouts/admin-layout-components/nav-main"
import { NavUser } from "@/layouts/admin-layout-components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type MenuGroup = {
  label: string
  items: NavItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Menu",
    items: [
      {
        title: "Dashboard",
        url: "/gundala-admin/d",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "User",
        url: "/gundala-admin/d/user",
        icon: Users,
      },
      {
        title: "Role",
        url: "/gundala-admin/d/role",
        icon: Shield,
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        title: "Article",
        url: "/gundala-admin/d/article",
        icon: Newspaper,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        url: "/gundala-admin/d/settings",
        icon: Settings,
      },
    ],
  },
]

const userData = {
  name: "Admin",
  email: "admin@example.com",
  avatar: "",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        {menuGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
