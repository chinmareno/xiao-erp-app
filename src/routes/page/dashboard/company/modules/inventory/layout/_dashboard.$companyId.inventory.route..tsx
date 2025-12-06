import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { CompanyIdLoader } from "../../../layout/_dashboard.$companyId.route";
import { useCompanyMemberStore } from "~/hooks/stores/useCompanyMemberStore";
import { useCompanyStore } from "~/hooks/stores/useCompanyStore";

export default function DashboardPurchasingLayout() {
  const { selectedCompany } = useCompanyStore();
  const { companyMember } = useCompanyMemberStore();

  useEffect(() => {
    const moduleNotExist = !selectedCompany?.modules.includes("INVENTORY");
    const noPermission = !companyMember?.permissions?.includes("INVENTORY");

    if (moduleNotExist || noPermission) {
      throw new Error("Not Found");
    }
  }, [selectedCompany, companyMember]);

  return <Outlet />;
}
