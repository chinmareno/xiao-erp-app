import { Outlet, redirect, useLoaderData, useLocation } from "@remix-run/react";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { auth } from "~/lib/auth.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Company, SideNavbar } from "./SideNavbar";
import { createCallerWithContext } from "~/.server/root.server";
import { createTRPCContext } from "~/.server/trpc.server";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) return redirect("/login");

  const user = session.user;
  const caller = await createCallerWithContext(request);

  const companies = await caller.company.getByUserId();

  const role = (await createTRPCContext(request)).role;

  return { user, companies, role };
}

export type DashboardContext = Company | null;

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const segments = pathname.split("/");

  const loaderData = useLoaderData<typeof loader>();

  const [selectedCompany, setSelectedCompany] = useState<DashboardContext>(
    loaderData.companies[0] || null
  );

  useEffect(() => {
    if (!selectedCompany) setSelectedCompany(loaderData.companies[0]);
  }, [loaderData, selectedCompany]);

  return (
    <SidebarProvider>
      <SideNavbar
        role={loaderData.role}
        user={loaderData.user}
        companies={loaderData.companies}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {2 < segments.length ? (
              <Breadcrumb>
                <BreadcrumbList className="capitalize">
                  <BreadcrumbItem>{segments[1]}</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{segments[2]}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ) : (
              <h1>Company slogan</h1>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div>
            <Outlet context={selectedCompany} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
