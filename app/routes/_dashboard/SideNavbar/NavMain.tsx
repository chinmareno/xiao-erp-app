import { Link } from "@remix-run/react";
import { ChevronRight } from "lucide-react";

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
import { useCompanyStore } from "~/hooks/useSelectedCompanyStore";
import { MODULES_SUBMODULES } from "../../../constants/companyModules";

export function NavMain() {
  const { selectedCompany } = useCompanyStore();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Modules</SidebarGroupLabel>
      <SidebarMenu>
        {selectedCompany?.modules.map((module, index) => (
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
                        <Link to={`${module}/${submodule}`}>
                          <span>{submodule}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
