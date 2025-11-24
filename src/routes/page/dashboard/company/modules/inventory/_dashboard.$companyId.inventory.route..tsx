import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { CompanyIdLoader } from "../../_dashboard.$companyId.route";

export default function DashboardPurchasingLayout() {
  const companyLoaderData = useRouteLoaderData<CompanyIdLoader>(
    "_dashboard.$companyId"
  );
  useEffect(() => {
    if (
      (companyLoaderData &&
        !companyLoaderData?.userSelectedCompany?.modules.includes(
          "INVENTORY"
        )) ||
      (companyLoaderData &&
        !companyLoaderData?.userCompanyMember?.permissions?.includes(
          "INVENTORY"
        ))
    ) {
      throw new Error("Not Found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyLoaderData]);

  return <Outlet />;
}
