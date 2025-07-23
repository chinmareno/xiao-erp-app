import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { createCallerWithContext } from "~/.server/root.server";
import { useCompanyStore } from "~/hooks/useCompanyStore";
import { DashboardLoader } from "./_dashboard/route";

export type CompanyIdLoader = typeof loader;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const caller = await createCallerWithContext(request);
  const companyId = params.companyId as string;

  const userCompanyMember = await caller.companyMember.getByCompanyId(
    companyId
  );

  if (!userCompanyMember) throw new Error("Not Found");

  return userCompanyMember;
}

export default function DashboardCompanyIdLayout() {
  const { selectedCompany, setSelectedCompany, permissions, setPermissions } =
    useCompanyStore();

  const params = useParams();

  const dashboardLoaderData =
    useRouteLoaderData<DashboardLoader>("routes/_dashboard");

  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    if (selectedCompany?.id !== params.companyId) {
      const companyDetail = dashboardLoaderData?.companies.find(
        ({ id }) => id === params.companyId
      );
      companyDetail && setSelectedCompany(companyDetail);
    }
    if (permissions === null) setPermissions(loaderData.permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.companyId, selectedCompany]);

  return (
    <Outlet
      context={{ dashboardLoaderData, companyIdLoaderData: loaderData }}
    />
  );
}
