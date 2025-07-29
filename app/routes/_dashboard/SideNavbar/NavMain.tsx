import { Link, useRouteLoaderData } from "@remix-run/react";
import { ChevronRight, Cpu } from "lucide-react";

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

export function NavMain() {
  const { company, permissions } = useCompanyStore();
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
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={module}>
                      {/* TODO: Module Icon */}
                      <span>{module}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
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
