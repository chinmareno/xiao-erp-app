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
import { MODULES_SUBMODULES } from "../../../constants/companyModules";
import { useCompanyStore } from "~/hooks/useSelectedCompanyStore";
import { useOpenDialogNavbarStore } from "~/hooks/useOpenDialogNavbarStore";

const modulesIcon = {
  PURCHASING: <ShoppingCart className="h-4 w-4" />,
  INVENTORY: <Package className="h-4 w-4" />,
  SALES: <DollarSign className="h-4 w-4" />,
};

export function NavMain() {
  const { company, permissions } = useCompanyStore();
  const navigate = useNavigate();
  const { openDialog } = useOpenDialogNavbarStore();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {company === null
          ? null
          : company?.modules && (permissions?.length ?? 0) > 0
          ? "Modules"
          : "No Permissions yet"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {permissions &&
          permissions.map((module, index) => {
            if (!company) return null;
            return company.modules.includes(module) ? (
              <Collapsible
                key={module}
                asChild
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {!openDialog ? (
                    <SidebarMenuButton
                      tooltip={module}
                      onClick={() => {
                        navigate(
                          `${company.id}/${module.toLocaleLowerCase()}/${
                            MODULES_SUBMODULES[module][0]
                          }`
                        );
                      }}
                    >
                      {modulesIcon[module]}
                    </SidebarMenuButton>
                  ) : (
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
                                company.id
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
