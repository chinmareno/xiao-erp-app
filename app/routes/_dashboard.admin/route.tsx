import { Outlet, useOutletContext } from "@remix-run/react";
import { useEffect } from "react";

export default function DashboardAdminLayout() {
  const outletContext = useOutletContext<"USER" | "SUPERADMIN">();
  useEffect(() => {
    if (outletContext === "USER") throw new Error("Not Found");
  }, [outletContext]);
  return outletContext === "SUPERADMIN" && <Outlet />;
}
