import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { Link } from "@remix-run/react";
import { Company } from "~/routes/_dashboard/SideNavbar";

export function CompanySwitcher({
  companies,
  role,
  selectedCompany,
  setSelectedCompany,
}: {
  role: "SUPERADMIN" | "USER";
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  companies: {
    name: string;
    adress?: string | null;
    industry?: string | null;
    desc?: string | null;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedCompany?.name ?? "No Company Yet"}
                </span>
                <span className="truncate text-xs">
                  {selectedCompany?.industry ?? "N/A"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Companies
            </DropdownMenuLabel>

            {companies.length > 0 ? (
              companies.map((company) => (
                <DropdownMenuItem
                  key={company.name}
                  onClick={() => setSelectedCompany(company)}
                  className="gap-2 p-2"
                >
                  {company.name}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No companies available
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link to="/company/join">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Join Company
                </div>
              </Link>
            </DropdownMenuItem>
            {role === "SUPERADMIN" && (
              <DropdownMenuItem asChild className="gap-2 p-2">
                <Link to="/company/create">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Create Company
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
