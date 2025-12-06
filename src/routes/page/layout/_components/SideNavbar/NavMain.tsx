import { Link, useNavigate, useParams } from "@remix-run/react";
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
import { useOpenDialogNavbarStore } from "~/hooks/stores/useOpenDialogNavbarStore";
import { MODULES_SUBMODULES } from "~/constants/companyModules";
import { useCompanyStore } from "~/hooks/stores/useCompanyStore";
import { useCompanyMemberStore } from "../../../../../hooks/stores/useCompanyMemberStore";

const modulesIcon = {
  PURCHASING: <ShoppingCart className="h-4 w-4" />,
  INVENTORY: <Package className="h-4 w-4" />,
  SALES: <DollarSign className="h-4 w-4" />,
};

export function NavMain() {
  const navigate = useNavigate();

  const { openDialog } = useOpenDialogNavbarStore();
  const { selectedCompany } = useCompanyStore();
  const { companyMember } = useCompanyMemberStore();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {selectedCompany === null
          ? null
          : selectedCompany?.modules &&
            (companyMember?.permissions?.length ?? 0) > 0
          ? "Modules"
          : "No Permissions yet"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {companyMember?.permissions &&
          companyMember.permissions.map((module, index) => {
            if (!selectedCompany) return null;
            return (
              selectedCompany.modules.includes(module) && (
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
              )
            );
          })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
