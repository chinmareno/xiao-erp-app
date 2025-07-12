import { Outlet } from "@remix-run/react";
const _auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pb-7">
      <Outlet />
    </div>
  );
};

export default _auth;
