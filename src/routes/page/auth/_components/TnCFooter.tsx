import { Link } from "@remix-run/react";

type Props = {
  tncDesc: string | undefined;
  termOfService: string | undefined;
  and: string | undefined;
  privacyPolicy: string | undefined;
};

const TnCFooter = ({ tncDesc, termOfService, and, privacyPolicy }: Props) => {
  return (
    <div className=" text-xs text-center mt-1.5 text-muted-foreground">
      {tncDesc || "By clicking continue, you agree to our"}
      <Link
        className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
        to={"#"}
      >
        {termOfService || "Terms of Service"}
      </Link>{" "}
      {and || "and"}{" "}
      <Link
        className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
        to={"#"}
      >
        {privacyPolicy || "Privacy Policy"}
      </Link>
    </div>
  );
};

export default TnCFooter;
