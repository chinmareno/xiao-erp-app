import { Outlet } from "@remix-run/react";
import { useCompanyStore } from "~/hooks/useCompanyStore";

export default function DashboardPurchasingLayout() {
  const { selectedCompany } = useCompanyStore();

  if (
    selectedCompany === null ||
    !selectedCompany?.modules.includes("PURCHASING")
  ) {
    throw new Error("Page Not Found");
  }

  return <Outlet />;
}
