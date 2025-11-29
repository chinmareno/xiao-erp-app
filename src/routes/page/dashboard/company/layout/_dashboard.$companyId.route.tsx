import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { createCallerWithContext } from "~/server/api/trpc.caller";
import { useSelectedCompanyStore } from "~/hooks/common/useSelectedCompanyStore";

export type CompanyIdLoader = typeof loader;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  if (companyId === "favicon.ico") {
    throw new Response("Not Found", { status: 404 });
  }

  const caller = await createCallerWithContext(request, companyId);

  const userSelectedCompany = await caller.company.getByCompanyId();
  const userCompanyMember = await caller.companyMember.getByCompanyId();

  if (!userCompanyMember || !userSelectedCompany) {
    throw new Error("Not Found");
  }

  return { userCompanyMember, userSelectedCompany };
}
export default function DashboardCompanyIdLayout() {
  const { setSelectedCompany, setPermissions } = useSelectedCompanyStore();
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    setSelectedCompany(loaderData.userSelectedCompany);
    setPermissions(loaderData.userCompanyMember.permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);
  return <Outlet />;
}
