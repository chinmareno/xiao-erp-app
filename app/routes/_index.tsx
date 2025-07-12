import { Outlet } from "@remix-run/react";

const Index = () => {
  return (
    <div className="min-h-screen items-center justify-center text-black dark:text-slate-100 bg-white">
      <Outlet />
    </div>
  );
};

export default Index;
