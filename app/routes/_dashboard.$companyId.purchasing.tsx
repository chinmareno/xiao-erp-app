import { Outlet } from "@remix-run/react";
import { useEffect } from "react";
import { useCompanyStore } from "~/hooks/useCompanyStore";

export default function DashboardPurchasingLayout() {
  const { selectedCompany } = useCompanyStore();

  useEffect(() => {
    if (
      selectedCompany === null ||
      !selectedCompany?.modules.includes("PURCHASING")
    ) {
      throw new Error("Page Not Found");
    }
  }, [selectedCompany]);

  return <Outlet />;
}
