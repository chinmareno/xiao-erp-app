import { Building, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { Link, useNavigate } from "@remix-run/react";
import { useCompanyStore } from "~/hooks/stores/useCompanyStore";
import { useUserStore } from "~/hooks/stores/useUserStore";

export const CompanySwitcher = () => {
  const { isMobile } = useSidebar();

  const navigate = useNavigate();
  const { selectedCompany, companies } = useCompanyStore();
  const { user } = useUserStore();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Building />
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

            {companies && companies.length > 0 ? (
              companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => {
                    if (selectedCompany?.id !== company.id) {
                      navigate(company.id);
                    }
                  }}
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

            {user?.role === "SUPERADMIN" && (
              <>
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link to="/admin/company/join">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Join Company
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link to="/admin/company/create">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Create Company
                    </div>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
