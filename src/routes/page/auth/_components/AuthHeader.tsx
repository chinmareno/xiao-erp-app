import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

type Props = {
  title: string;
  subTitle: string;
};

const AuthHeader = ({ title, subTitle }: Props) => {
  return (
    <CardHeader className="text-center">
      <CardTitle className="lg:text-2xl font-bold">{title}</CardTitle>

      <CardDescription>{subTitle}</CardDescription>
    </CardHeader>
  );
};

export default AuthHeader;
