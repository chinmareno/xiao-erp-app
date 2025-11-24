import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";

type Props = {
  signupGoogle: () => Promise<void>;
  isGoogleLoading: boolean;
  label: string;
};

export const GoogleAuthButton = ({
  signupGoogle,
  isGoogleLoading,
  label,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        onClick={signupGoogle}
        variant="outline"
        className="w-full"
        disabled={isGoogleLoading}
      >
        {isGoogleLoading && <Loader2 className="animate-spin h-4 w-4" />}
        <FcGoogle className="h-6 w-6 flex-shrink-0" />
        {label}
      </Button>
    </div>
  );
};
