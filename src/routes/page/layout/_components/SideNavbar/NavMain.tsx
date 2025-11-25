import { Link, useNavigate } from "@remix-run/react";
import { ChevronRight, DollarSign, Package, ShoppingCart } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { useSelectedCompanyStore } from "~/hooks/common/useSelectedCompanyStore";
import { useOpenDialogNavbarStore } from "~/hooks/common/useOpenDialogNavbarStore";
import { MODULES_SUBMODULES } from "~/constants/companyModules";

const modulesIcon = {
  PURCHASING: <ShoppingCart className="h-4 w-4" />,
  INVENTORY: <Package className="h-4 w-4" />,
  SALES: <DollarSign className="h-4 w-4" />,
};

export function NavMain() {
  const { selectedCompany, permissions } = useSelectedCompanyStore();
  const navigate = useNavigate();
  const { openDialog } = useOpenDialogNavbarStore();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {selectedCompany === null
          ? null
          : selectedCompany?.modules && (permissions?.length ?? 0) > 0
          ? "Modules"
          : "No Permissions yet"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {permissions &&
          permissions.map((module, index) => {
            if (!selectedCompany) return null;
            return selectedCompany.modules.includes(module) ? (
              <Collapsible
                key={module}
                asChild
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {!openDialog ? (
                    // Collapsed sidebar: Show only icon, and navigate to first submodule when clicked
                    <SidebarMenuButton
                      tooltip={module}
                      onClick={() => {
                        navigate(
                          `${
                            selectedCompany.id
                          }/${module.toLocaleLowerCase()}/${
                            MODULES_SUBMODULES[module][0]
                          }`
                        );
                      }}
                    >
                      {modulesIcon[module]}
                      sas
                    </SidebarMenuButton>
                  ) : (
                    // Expanded sidebar: Show icon & text, and toggle show/hide submodules when clicked
                    <CollapsibleTrigger disabled={!openDialog} asChild>
                      <SidebarMenuButton tooltip={module}>
                        {modulesIcon[module]}
                        <span>{module}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  )}

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {MODULES_SUBMODULES[module]?.map((submodule) => (
                        <SidebarMenuSubItem key={submodule}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={`${
                                selectedCompany.id
                              }/${module.toLocaleLowerCase()}/${submodule}`}
                            >
                              <span className="capitalize">{submodule}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <div>dd</div>
            );
          })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
