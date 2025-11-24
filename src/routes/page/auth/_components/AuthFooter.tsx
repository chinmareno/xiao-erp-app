import { Link } from "@remix-run/react";

type Props = {
  desc: string;
  redirectTo: string;
  redirectDesc: string;
};

const AuthFooter = ({ desc, redirectDesc, redirectTo }: Props) => {
  return (
    <div className="text-center text-muted-foreground text-sm">
      {desc}
      <Link
        to={redirectTo}
        prefetch="intent"
        className="hover:underline  text-blue-600 hover:text-blue-800"
      >
        {redirectDesc}
      </Link>
    </div>
  );
};

export default AuthFooter;
