import { SetStateAction } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
  label: string | undefined;
  placeholder: string | undefined;
  email: string;
  setEmail: (value: SetStateAction<string>) => void;
  errorMessage: string | undefined;
};

const EmailInput = ({
  label,
  placeholder,
  email,
  setEmail,
  errorMessage,
}: Props) => {
  return (
    <div>
      <div className="space-y-2">
        <Label htmlFor="email">{label || "Email"}</Label>
        <Input
          id="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          value={email}
          type="text"
          placeholder={placeholder || "Enter your email"}
        />
        {errorMessage && (
          <p className="text-sm text-red-600">
            {errorMessage || "Invalid email address"}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailInput;
