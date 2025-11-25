import { Form } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ActionFunctionArgs } from "@remix-run/node";
import { formDataParser } from "~/lib/formDataParser";
import { auth } from "~/lib/auth/auth.server";
import { GoogleAuthButton } from "../_components/GoogleAuthButton";
import AuthSeparator from "../_components/AuthSeparator";
import TnCFooter from "../_components/TnCFooter";
import AuthFooter from "../_components/AuthFooter";
import SubmitAuthButton from "../_components/SubmitAuthButton";
import PasswordInput from "../_components/PasswordInput";
import PasswordRequirementCheck from "./_components/PasswordRequirementCheck";
import { ConfirmPasswordInput } from "./_components/ConfirmPassword";
import { OTPInput } from "./_components/OTPInput";
import EmailInput from "../_components/EmailInput";
import { useTranslation } from "~/hooks/common/useTranslation";
import { useSignupForm } from "./_hooks/useSignupForm";

export async function action({ request }: ActionFunctionArgs) {
  const formData = (await formDataParser(request)) as {
    password: string;
    email: string;
  };

  const token = await auth.api.createVerificationOTP({
    body: { email: formData.email, type: "forget-password" },
  });
  await auth.api.resetPasswordEmailOTP({
    body: { email: formData.email, otp: token, password: formData.password },
  });
  await auth.api.signInEmail({
    body: {
      email: formData.email,
      password: formData.password,
    },
    headers: request.headers,
  });

  return { email: formData.email, password: formData.password };
}

export default function SignupForm() {
  const {
    OTP,
    setOTP,
    sendOTPCooldown,
    isSendingOTP,
    handleSendOTP,
    signup,
    isCredentialLoading,
    signupGoogle,
    isGoogleLoading,
    email,
    setEmail,
    password,
    setPassword,
    passwordIsVisible,
    setPasswordIsVisible,
    confirmPassword,
    setConfirmPassword,
    confirmPasswordIsVisible,
    setConfirmPasswordIsVisible,
    errors,
  } = useSignupForm();

  const t = useTranslation();
  const scopedT = t?.auth;

  return (
    <div className="min-w-[400px] min-h-[700px]">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="lg:text-2xl font-bold">
            {scopedT?.signup.title}
          </CardTitle>
          <CardDescription>{scopedT?.signup.desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form onSubmit={signup} className="space-y-4">
            <div className="grid gap-6">
              <GoogleAuthButton
                signupGoogle={signupGoogle}
                isGoogleLoading={isGoogleLoading}
                label={scopedT?.signup.googleButton || "Signup with Google"}
              />

              <AuthSeparator label={scopedT?.signup.separator || "or"} />

              <div className="grid gap-2">
                <EmailInput
                  label={scopedT?.signup.emailLabel}
                  email={email}
                  setEmail={setEmail}
                  placeholder={scopedT?.signup.emailPlaceholder}
                  errorMessage={
                    errors?.email
                      ? scopedT?.signup.error.invalidEmail
                      : undefined
                  }
                />

                <OTPInput
                  label={scopedT?.signup.OTPLabel}
                  placeholder={scopedT?.signup.OTPPlaceholder}
                  sendOtp={scopedT?.signup.sendOtp}
                  wait={scopedT?.signup.wait}
                  OTP={OTP}
                  setOTP={setOTP}
                  handleSendOTP={handleSendOTP}
                  sendOTPCooldown={sendOTPCooldown}
                  email={email}
                  isSendingOTP={isSendingOTP}
                  errorMessage={
                    errors?.OTP ? scopedT?.signup.error.otpError : undefined
                  }
                />

                <div className="grid gap-2">
                  <PasswordInput
                    label={scopedT?.signup.passwordLabel || "Password"}
                    password={password}
                    setPassword={setPassword}
                    passwordIsVisible={passwordIsVisible}
                    setPasswordIsVisible={setPasswordIsVisible}
                    placeholder={
                      scopedT?.signup.passwordPlaceholder ||
                      "Enter your password"
                    }
                    errorMessage={
                      errors?.password
                        ? scopedT?.signup.error.invalidPassword
                        : undefined
                    }
                  />
                  <PasswordRequirementCheck
                    password={password}
                    includeNumber={
                      scopedT?.signup.passwordRequirement.includeNumber ||
                      "Includes a number"
                    }
                    minChar={
                      scopedT?.signup.passwordRequirement.minChar ||
                      "8 characters minimum"
                    }
                    oneLowerCase={
                      scopedT?.signup.passwordRequirement.oneLowerCase ||
                      "One lowercase character"
                    }
                    oneUpperCase={
                      scopedT?.signup.passwordRequirement.oneUpperCase ||
                      "One uppercase character"
                    }
                  />
                </div>

                <ConfirmPasswordInput
                  label={scopedT?.signup.confirmPasswordLabel}
                  password={confirmPassword}
                  setPassword={setConfirmPassword}
                  passwordIsVisible={confirmPasswordIsVisible}
                  setPasswordIsVisible={setConfirmPasswordIsVisible}
                  placeholder={
                    scopedT?.signup.confirmPasswordPlaceholder ||
                    "Confirm password"
                  }
                  errorMessage={
                    errors?.confirmPassword
                      ? scopedT?.signup.error.invalidConfirmPassword
                      : undefined
                  }
                />

                <SubmitAuthButton
                  isCredentialLoading={isCredentialLoading}
                  label={scopedT?.signup.signupButton}
                />
              </div>

              <AuthFooter
                desc={scopedT?.signup.haveAccount || "Already have an account?"}
                redirectTo="/login"
                redirectDesc={scopedT?.signup.loginLink || "Login"}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      <TnCFooter
        tncDesc={scopedT?.footer.tAndC}
        termOfService={scopedT?.footer.termsOfService}
        and={t?.common.and}
        privacyPolicy={scopedT?.footer.privacyPolicy}
      />
    </div>
  );
}
