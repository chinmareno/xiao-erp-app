import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useRouteLoaderData,
  useSubmit,
} from "@remix-run/react";
import { Check, Dot, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth/auth-client";
import type { loader as localesLoader } from "~/root";
import { toast } from "sonner";
import { ActionFunctionArgs } from "@remix-run/node";
import { formDataParser } from "~/lib/formDataParser";
import { auth } from "~/lib/auth/auth.server";
import { GoogleAuthButton } from "../_components/GoogleAuthButton";
import AuthSeparator from "../_components/AuthSeparator";
import TnCFooter from "../_components/TnCFooter";
import AuthFooter from "../_components/AuthFooter";
import SubmitAuthButton from "../_components/SubmitAuthButton";
import PasswordInput from "../_components/PasswordInput";

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

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .refine((val) => /[A-Z]/.test(val))
      .refine((val) => /[a-z]/.test(val))
      .refine((val) => /\d/.test(val)),
    confirmPassword: z.string(),
    OTP: z.string().min(6).max(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  });

type SignupError = {
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  OTP: boolean;
};

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirnPasswordIsVisible, setConfirmPasswordIsVisible] =
    useState(false);
  const [errors, setErrors] = useState<SignupError | null>(null);
  const [sendOTPCooldown, setSendOTPCooldown] = useState(0);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [OTP, setOTP] = useState("");
  const [isCredentialLoading, setIsCredentialLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      authClient.signIn.email({
        email,
        password,
        fetchOptions: { onSuccess: () => navigate("/") },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  const t = useRouteLoaderData<typeof localesLoader>("root");
  const scopedT = t?.auth;

  const submit = useSubmit();

  const signup = async () => {
    const result = signupSchema.safeParse({
      email,
      password,
      confirmPassword,
      OTP,
    });

    if (!result.success) {
      const {
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        OTP: OTPError,
      } = result.error.format();

      return setErrors({
        email: !!emailError,
        password: !!passwordError,
        confirmPassword: !!confirmPasswordError,
        OTP: !!OTPError,
      });
    }
    setErrors(null);

    const name = email.split("@")[0];

    setIsCredentialLoading(true);
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: OTP,
    });
    if (error && error?.message === "Invalid OTP")
      toast.error("Wrong OTP. Please try again.");
    // case: first time signup with credentials
    else if (error && error?.message === "User not found") {
      await authClient.signUp.email({
        email,
        name,
        password,
        fetchOptions: {
          onSuccess: () => navigate("/"),
          onError: (e) => {
            toast.error(e.error.message);
          },
        },
      });
    } else if (error && error.message) return toast.error(error.message);
    // case: first time signup with social provider, so now u link the credential via forget password approach
    else {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("email", email);
      submit(formData, { method: "post" });
    }
    setIsCredentialLoading(false);
  };

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      type: "email-verification",
      email,
    });
    setIsSendingOTP(false);
    if (error) return toast.error(error.message);

    toast.success("OTP sent! Please check your email.");

    setSendOTPCooldown(60);
  };

  const signupGoogle = async () => {
    setIsGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/signup",
    });
  };

  useEffect(() => {
    if (sendOTPCooldown > 0) {
      const timer = setTimeout(
        () => setSendOTPCooldown(sendOTPCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [sendOTPCooldown]);

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
                <Label htmlFor="email">{scopedT?.signup.emailLabel}</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  type="text"
                  placeholder={scopedT?.signup.emailPlaceholder}
                />
                {errors?.email && (
                  <p className="text-sm text-red-600">
                    {scopedT?.signup.error.invalidEmail}
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="OTP">Enter OTP</Label>
                  <div className="relative ">
                    <Input
                      id="OTP"
                      type="text"
                      onChange={(e) => setOTP(e.currentTarget.value)}
                      value={OTP}
                      className="font-semibold"
                      placeholder="6-digit code"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSendOTP}
                      disabled={
                        sendOTPCooldown > 0 ||
                        isSendingOTP ||
                        !z.string().email().safeParse(email).success
                      }
                      className="absolute z-50 right-0 bottom-0"
                    >
                      {isSendingOTP ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : sendOTPCooldown > 0 ? (
                        `Wait ${sendOTPCooldown}s`
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                  {errors?.OTP && (
                    <p className="text-sm text-red-600">Invalid OTP</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {scopedT?.signup.passwordLabel}
                  </Label>
                  <div className="relative flex">
                    <Input
                      id="password"
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      value={password}
                      type={passwordIsVisible ? "text" : "password"}
                      placeholder={scopedT?.signup.passwordPlaceholder}
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
                  {errors?.password && (
                    <p className="lg:text-sm text-red-600">
                      {scopedT?.signup.error.invalidPassword}
                    </p>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/[a-z]/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="lg:text-sm">
                        {scopedT?.signup.passwordRequirement.oneUpperCase}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="text-sm">
                        {scopedT?.signup.passwordRequirement.oneLowerCase}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/\d/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="text-sm">
                        {scopedT?.signup.passwordRequirement.includeNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {password.length >= 8 ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="lg:text-sm">
                        {scopedT?.signup.passwordRequirement.minChar}
                      </p>
                    </div>
                  </div>
                </div>
                <PasswordInput
                  id="confirmPassword"
                  label={
                    scopedT?.signup.confirmPasswordLabel || "Confirm Password"
                  }
                  password={confirmPassword}
                  setPassword={setConfirmPassword}
                  passwordIsVisible={confirnPasswordIsVisible}
                  setPasswordIsVisible={setConfirmPasswordIsVisible}
                  placeholder={
                    scopedT?.signup.confirmPasswordLabel || "Confirm password"
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
