import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

type Props = {
  isCredentialLoading: boolean;
  label: string | undefined;
};

const SubmitAuthButton = ({ isCredentialLoading, label }: Props) => {
  return (
    <Button
      type="submit"
      className="w-full bg-blue-700 hover:bg-blue-900"
      disabled={isCredentialLoading}
    >
      {isCredentialLoading && <Loader2 className="animate-spin h-4 w-4" />}
      {label || "Submit"}
    </Button>
  );
};

export default SubmitAuthButton;
