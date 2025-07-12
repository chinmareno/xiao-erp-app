import { Form, Link, useNavigate } from "@remix-run/react";
import { Check, Dot, Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
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
import { authClient } from "~/lib/auth-client";

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .refine((val) => /[A-Z]/.test(val))
      .refine((val) => /[a-z]/.test(val))
      .refine((val) => /\d/.test(val)),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  });

type SignupError = {
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
};

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [confirnPasswordIsVisible, setConfirmPasswordIsVisible] =
    useState(false);

  const [errors, setErrors] = useState<SignupError | null>(null);

  const { t } = useTranslation(["auth", "common"]);

  const navigate = useNavigate();

  const signup = async () => {
    const result = signupSchema.safeParse({ email, password, confirmPassword });

    if (result.success) {
      setErrors(null);

      const name = email.split("@")[0];

      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      data ? navigate("/dashboard") : alert(error.message);
    } else {
      const { email, password, confirmPassword } = result.error.format();

      return setErrors({
        email: !!email,
        password: !!password,
        confirmPassword: !!confirmPassword,
      });
    }
  };

  const signupGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/signup",
    });
  };

  return (
    <div className="min-w-[400px] min-h-[700px]">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="lg:text-2xl font-bold">
            {t("signup.title")}
          </CardTitle>
          <CardDescription>{t("signup.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form onSubmit={signup} className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  onClick={signupGoogle}
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  <FcGoogle className="h-6 w-6 flex-shrink-0" />
                  {t("signup.googleButton")}
                </Button>
              </div>
              <div className="relative text-center lg:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  {t("signup.separator")}
                </span>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("signup.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="text"
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    value={email}
                    placeholder={t("signup.emailPlaceholder")}
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-600">
                      {t("signup.error.invalidEmail")}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("signup.passwordLabel")}</Label>
                  <div className="relative flex">
                    <Input
                      id="password"
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      value={password}
                      type={passwordIsVisible ? "text" : "password"}
                      placeholder={t("signup.passwordPlaceholder")}
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
                      {t("signup.error.invalidPassword")}
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
                        {t("signup.passwordRequirement.oneLowerCase")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="text-sm">
                        {t("signup.passwordRequirement.oneUpperCase")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/\d/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="text-sm">
                        {t("signup.passwordRequirement.includeNumber")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {password.length >= 8 ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="lg:text-sm">
                        {t("signup.passwordRequirement.minChar")}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    {t("signup.confirmPasswordLabel")}
                  </Label>
                  <div className="relative flex">
                    <Input
                      id="confirmPassword"
                      onChange={(e) =>
                        setConfirmPassword(e.currentTarget.value)
                      }
                      value={confirmPassword}
                      type={confirnPasswordIsVisible ? "text" : "password"}
                      placeholder={t("signup.confirmPasswordLabel")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmPasswordIsVisible((prev) => !prev)
                      }
                    >
                      {confirnPasswordIsVisible ? (
                        <EyeClosed className="absolute h-5 w-5 right-2 self-center" />
                      ) : (
                        <Eye className="absolute h-5 w-5 right-2 self-center" />
                      )}
                    </button>
                  </div>
                  {errors?.confirmPassword && password !== confirmPassword && (
                    <p className="lg:text-sm text-red-600">
                      {t("signup.error.invalidConfirmPassword")}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-900"
                >
                  {t("signup.signupButton")}
                </Button>
              </div>
              <div className="text-center text-muted-foreground text-sm">
                {t("signup.haveAccount")}
                <Link
                  to="/login"
                  prefetch="intent"
                  className="hover:underline  text-blue-600 hover:text-blue-800"
                >
                  {t("signup.loginLink")}
                </Link>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <div className=" text-xs text-center mt-1.5 text-muted-foreground">
        {t("auth:footer.tAndC")}{" "}
        <Link
          className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
          to={"#"}
        >
          {t("auth:footer.termsOfService")}
        </Link>{" "}
        {t("common:and")}{" "}
        <Link
          className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
          to={"#"}
        >
          {t("auth:footer.privacyPolicy")}
        </Link>
      </div>
    </div>
  );
}
