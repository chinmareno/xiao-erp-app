import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { CompanyIdLoader } from "./_dashboard.$companyId";

export default function DashboardPurchasingLayout() {
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "routes/_dashboard.$companyId"
  );
  useEffect(() => {
    if (
      (companyLoaderData &&
        !companyLoaderData?.userSelectedCompany?.modules.includes(
          "PURCHASING"
        )) ||
      (companyLoaderData &&
        !companyLoaderData?.userCompanyMember?.permissions?.includes(
          "PURCHASING"
        ))
    ) {
      throw new Error("Not Found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyLoaderData]);

  return <Outlet />;
}
