"use client"

import * as React from "react"
import {
  Images,
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
import { useAuthContext } from "@/contexts/auth-context"
import type { TMenuPermissionKey } from "@/constants/permissions"

type MenuGroup = {
  label: string
  items: (NavItem & { permission: TMenuPermissionKey })[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Menu",
    items: [
      {
        title: "Dashboard",
        url: "/gundala-admin/d",
        icon: LayoutDashboard,
        permission: "menu.dashboard.view",
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
        permission: "menu.user.view",
      },
      {
        title: "Role",
        url: "/gundala-admin/d/role",
        icon: Shield,
        permission: "menu.role.view",
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
        permission: "menu.article.view",
      },
      {
        title: "Gallery",
        url: "/gundala-admin/d/gallery",
        icon: Images,
        permission: "menu.gallery.view",
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
        permission: "menu.settings.view",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, role, permissions } = useAuthContext()
  const can = (key: TMenuPermissionKey) => role === "admin" || (permissions ?? []).includes(key)

  const userData = {
    name: user?.name ?? "Admin",
    email: user?.email ?? "admin@example.com",
    avatar: user?.avatar_url ?? "",
  }

  const visibleGroups = menuGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        {visibleGroups.map((group) => (
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
