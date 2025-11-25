import { Eye, EyeClosed } from "lucide-react";
import { SetStateAction } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export type PasswordInputProps = {
  id?: string;
  label: string | undefined;
  placeholder: string | undefined;
  password: string;
  setPassword: (value: SetStateAction<string>) => void;
  passwordIsVisible: boolean;
  setPasswordIsVisible: (value: SetStateAction<boolean>) => void;
  errorMessage: string | undefined;
};

const PasswordInput = ({
  id,
  label,
  placeholder,
  password,
  setPassword,
  passwordIsVisible,
  setPasswordIsVisible,
  errorMessage,
}: PasswordInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id || "password"}>{label || "Password"}</Label>
      <div className="flex relative">
        <Input
          id={id || "password"}
          onChange={(e) => setPassword(e.currentTarget.value)}
          value={password}
          type={passwordIsVisible ? "text" : "password"}
          placeholder={placeholder || "Enter your password"}
        />
        <button
          type="button"
          onClick={() => setPasswordIsVisible((prev) => !prev)}
        >
          {passwordIsVisible ? (
            <EyeClosed className="absolute h-5 w-5 right-2 self-center" />
          ) : (
            <Eye className="absolute h-5 w-5 right-2 self-center" />
          )}
        </button>
      </div>
      {errorMessage && (
        <p className="lg:text-sm text-red-600">
          {errorMessage || "Password Invalid"}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
