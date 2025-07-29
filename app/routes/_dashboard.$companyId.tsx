import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { createCallerWithContext } from "~/api/root.server";
import { useCompanyStore } from "~/hooks/useSelectedCompanyStore";

export type CompanyIdLoader = typeof loader;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const companyId = params.companyId as string;
  console.log("Company ID from params:", companyId);
  
  const caller = await createCallerWithContext(request, companyId);

  const userSelectedCompany = await caller.company.getByCompanyId();
  const userCompanyMember = await caller.companyMember.getByCompanyId();

  console.log("userSelectedCompany:", userSelectedCompany);
  console.log("userCompanyMember:", userCompanyMember);

  if (!userCompanyMember || !userSelectedCompany) {
    console.log("Error: Missing data", { userCompanyMember: !!userCompanyMember, userSelectedCompany: !!userSelectedCompany });
    throw new Error("Not Found");
  }

  return { userCompanyMember, userSelectedCompany };
}
export default function DashboardCompanyIdLayout() {
  const { setCompany, setPermissions } = useCompanyStore();
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    setCompany(loaderData.userSelectedCompany);
    setPermissions(loaderData.userCompanyMember.permissions);
  }, [loaderData]);
  return <Outlet />;
}
