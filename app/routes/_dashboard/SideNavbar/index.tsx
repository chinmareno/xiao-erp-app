import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { CompanySwitcher } from "~/components/company-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { NavUser } from "./NavUser";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: null,
  },
  companies: [
    {
      name: "Huaxin",
      logo: GalleryVerticalEnd,
      desc: "Chip company",
    },
    {
      name: "Gerun.",
      logo: AudioWaveform,
      desc: "Ice cream",
    },
    {
      name: "Unknown",
      logo: Command,
      desc: "IDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
    },
  ],
  modules: [
    {
      title: "Accounting",
      url: "#",
      icon: SquareTerminal,
      submodules: [
        {
          title: "Ledger",
          url: "#",
        },
        {
          title: "Book keeping",
          url: "#",
        },
        {
          title: "bla3",
          url: "#",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: Bot,
      submodules: [
        {
          title: "Genesis",
          url: "#",
        },
      ],
    },
    {
      title: "Purchasing",
      url: "#",
      icon: BookOpen,
      submodules: [
        {
          title: "supplier",
          url: "/purchasing/supplier",
        },
        {
          title: "purchase order",
          url: "#",
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: Settings2,
      submodules: [
        {
          title: "General",
          url: "#",
        },
      ],
    },
  ],
};

export function SideNavbar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher companies={data.companies} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain modules={data.modules} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
