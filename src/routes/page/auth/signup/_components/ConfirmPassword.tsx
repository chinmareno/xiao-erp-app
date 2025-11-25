import PasswordInput, {
  PasswordInputProps,
} from "../../_components/PasswordInput";

export const ConfirmPasswordInput = ({
  label,
  password,
  setPassword,
  passwordIsVisible,
  setPasswordIsVisible,
  placeholder,
  errorMessage,
}: PasswordInputProps) => {
  return (
    <PasswordInput
      id="confirmPassword"
      label={label || "Confirm Password"}
      password={password}
      setPassword={setPassword}
      passwordIsVisible={passwordIsVisible}
      setPasswordIsVisible={setPasswordIsVisible}
      placeholder={placeholder || "Confirm password"}
      errorMessage={errorMessage}
    />
  );
};
