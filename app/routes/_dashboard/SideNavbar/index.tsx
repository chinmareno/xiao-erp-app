import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { NavUser } from "./NavUser";
import { CompanySwitcher } from "./CompanySwitcher";
import { NavMain } from "./NavMain";

export type Company = {
  name: string;
  address?: string | null;
  industry?: string | null;
  desc?: string | null;
};

type User = {
  name: string;
  email: string;
  image?: string | null;
};

type Module = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  submodules: {
    title: string;
    url: string;
  }[];
};

type SideNavbarProps = React.ComponentProps<typeof Sidebar> & {
  user: User;
  companies: Company[];
  modules?: Module[];
  role: "SUPERADMIN" | "USER";
};

// TODO: add feature adding new modules for company
export function SideNavbar({ ...props }: SideNavbarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
