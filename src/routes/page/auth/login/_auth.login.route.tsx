import { Form, useRouteLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import type { loader as localesLoader } from "~/root";
import { useLoginForm } from "./_hooks/useLoginForm";
import { GoogleAuthButton } from "../_components/GoogleAuthButton";
import AuthSeparator from "../_components/AuthSeparator";
import EmailInput from "../_components/EmailInput";
import PasswordInput from "../_components/PasswordInput";
import SubmitAuthButton from "../_components/SubmitAuthButton";
import AuthHeader from "../_components/AuthHeader";
import AuthFooter from "../_components/AuthFooter";
import TnCFooter from "../_components/TnCFooter";

export default function LoginForm() {
  const t = useRouteLoaderData<typeof localesLoader>("root");
  const scopedT = t?.auth;

  const {
    email,
    setEmail,
    password,
    setPassword,
    passwordIsVisible,
    setPasswordIsVisible,
    errors,
    isCredentialLoading,
    isGoogleLoading,
    login,
    signupGoogle,
  } = useLoginForm();

  return (
    <div className="min-w-[400px] min-h-[700px]">
      <Card>
        <AuthHeader
          title={scopedT?.login.title || "Welcome Back"}
          subTitle={scopedT?.login.desc || "Login to your account"}
        />
        <CardContent className="space-y-4">
          <Form replace onSubmit={login} className="space-y-4">
            <div className="grid gap-6">
              <GoogleAuthButton
                signupGoogle={signupGoogle}
                isGoogleLoading={isGoogleLoading}
                label={scopedT?.login.googleButton || "Login with Google"}
              />

              <AuthSeparator label={scopedT?.login.separator || "or"} />

              <div className="grid gap-6">
                <EmailInput
                  label={scopedT?.login.emailLabel}
                  placeholder={scopedT?.login.emailPlaceholder}
                  email={email}
                  setEmail={setEmail}
                  errorMessage={
                    errors?.email
                      ? scopedT?.login.error.invalidEmail
                      : undefined
                  }
                />
                <PasswordInput
                  label={scopedT?.login.passwordLabel}
                  placeholder={scopedT?.login.passwordPlaceholder}
                  password={password}
                  setPassword={setPassword}
                  passwordIsVisible={passwordIsVisible}
                  setPasswordIsVisible={setPasswordIsVisible}
                  errorMessage={
                    errors?.password
                      ? scopedT?.login.error.invalidPassword
                      : undefined
                  }
                />
                <SubmitAuthButton
                  isCredentialLoading={isCredentialLoading}
                  label={scopedT?.login.loginButton}
                />
              </div>

              <AuthFooter
                desc={scopedT?.login.noAccount || "don't have an account?"}
                redirectTo="/signup"
                redirectDesc={scopedT?.login.signUpLink || "Sign up"}
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
