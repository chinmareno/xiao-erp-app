import { Outlet, useOutletContext } from "@remix-run/react";
import { useEffect } from "react";
import { useCompanyStore } from "~/hooks/useCompanyStore";
import { CompanyIdLoader } from "./_dashboard.$companyId";
import { DashboardLoader } from "./_dashboard/route";
import { type TypedResponse } from "@remix-run/node";

type DashboardPurchasingLayoutContext = {
  dashboardLoaderData: Exclude<
    Awaited<ReturnType<DashboardLoader>>,
    TypedResponse<never>
  >;

  companyIdLoaderData: Awaited<ReturnType<CompanyIdLoader>>;
};

export default function DashboardPurchasingLayout() {
  const { selectedCompany } = useCompanyStore();
  const { companyIdLoaderData, dashboardLoaderData } =
    useOutletContext<DashboardPurchasingLayoutContext>();

  useEffect(() => {
    if (dashboardLoaderData?.role === "SUPERADMIN") return;
    else if (
      selectedCompany === null ||
      !selectedCompany?.modules.includes("PURCHASING") ||
      !companyIdLoaderData?.permissions.includes("PURCHASING")
    ) {
      throw new Error("Not Found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]);

  return <Outlet />;
}
