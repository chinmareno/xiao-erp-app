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
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  role: "SUPERADMIN" | "USER";
};

// TODO: add modules for company
export function SideNavbar({
  user,
  companies,
  modules,
  role,
  setSelectedCompany,
  selectedCompany,
  ...props
}: SideNavbarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          role={role}
          companies={companies}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain modules={data.modules} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
