import { Outlet, redirect, useLocation } from "@remix-run/react";
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
import { SideNavbar } from "./SideNavbar";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAuth = await auth.api.getSession({
    headers: request.headers,
  });
  if (!isAuth) return redirect("/login");

  return null;
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const segments = pathname.split("/");

  return (
    <SidebarProvider>
      <SideNavbar />
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
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
