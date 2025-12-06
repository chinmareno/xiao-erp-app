import { Outlet } from "@remix-run/react";
import { useEffect } from "react";
import { useUserStore } from "~/hooks/stores/useUserStore";

export default function DashboardAdminLayout() {
  const { user } = useUserStore();
  useEffect(() => {
    if (user?.role === "USER") throw new Error("Not Found");
  }, [user]);
  return user?.role === "SUPERADMIN" && <Outlet />;
}
