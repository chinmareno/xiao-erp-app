import {
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
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
import { auth } from "~/lib/auth/auth.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { SideNavbar } from "./_components/SideNavbar";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { useEffect } from "react";
import { toast } from "sonner";
import { useInviteLinkTokenStore } from "~/hooks/common/useInviteLinkTokenStore";
import { Company, User } from "@prisma/client";
import { useOpenDialogNavbarStore } from "~/hooks/common/useOpenDialogNavbarStore";
import { createTRPCContext } from "~/server/api/trpc";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) return redirect("/login");

  const user = session.user;

  const caller = await createCallerWithContext(request);

  const companies = await caller.company.getByUserId();

  const role = (await createTRPCContext(request)).role;

  if (process.env.DEMO_MODE && companies.length === 0) {
    await caller.company.create({
      name: "DemoCorp International",
      address: "123 Innovation Drive, Tokyo, Japan",
      industry: "Technology",
      desc: "A demonstration company for testing and showcasing platform features.",
    });
    const companies = await caller.company.getByUserId();

    return { user, companies, role };
  }

  return { user, companies, role };
}

export type DashboardLoader = {
  user: User;
  companies: Company[];
  role: "SUPERADMIN" | "USER";
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const segments = pathname.split("/");

  const loaderData = useLoaderData<typeof loader>();

  const { token } = useInviteLinkTokenStore();

  const navigate = useNavigate();
  const { openDialog, setOpenDialog } = useOpenDialogNavbarStore();

  useEffect(() => {
    const userCreatedAt = new Date(loaderData.user.createdAt);
    const now = new Date();
    const diffInSeconds = Math.abs(
      (now.getTime() - userCreatedAt.getTime()) / 1000
    );
    if (diffInSeconds <= 5) {
      toast.success(
        `Welcome, ${
          loaderData.user.name || loaderData.user.email
        }. Your account has been created successfully.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token !== null) {
      navigate(`/invite/${token}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <SidebarProvider open={openDialog} onOpenChange={setOpenDialog}>
      <SideNavbar
        role={loaderData.role}
        user={loaderData.user}
        companies={loaderData.companies}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {3 < segments.length ? (
              <Breadcrumb>
                <BreadcrumbList className="capitalize">
                  <BreadcrumbItem>{segments[2]}</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{segments[3]}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ) : (
              <h1>Company slogan</h1>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div>
            <Outlet context={loaderData.role} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
