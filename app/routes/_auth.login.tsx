import { Form, Link, useNavigate } from "@remix-run/react";
import { Eye, EyeClosed } from "lucide-react";
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginError = {
  email: boolean;
  password: boolean;
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [errors, setErrors] = useState<LoginError | null>(null);

  const { t } = useTranslation(["auth", "common"]);

  const navigate = useNavigate();

  const login = async () => {
    const result = loginSchema.safeParse({ email, password });

    if (result.success) {
      setErrors(null);

      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      data ? navigate("/dashboard") : alert(error.message);
    } else {
      const { email, password } = result.error.format();

      return setErrors({
        email: !!email,
        password: !!password,
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
            {t("login.title")}
          </CardTitle>
          <CardDescription>{t("login.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form replace onSubmit={login} className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  onClick={signupGoogle}
                  variant="outline"
                  className="w-full"
                >
                  <FcGoogle className="h-6 w-6 flex-shrink-0" />
                  {t("login.googleButton")}
                </Button>
              </div>
              <div className="relative text-center lg:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  {t("login.separator")}
                </span>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.emailLabel")}</Label>
                  <Input
                    id="email"
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    value={email}
                    type="text"
                    placeholder={t("login.emailPlaceholder")}
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-600">
                      {t("login.error.invalidEmail")}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("login.passwordLabel")}</Label>
                  <div className="flex relative">
                    <Input
                      id="password"
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      value={password}
                      type={passwordIsVisible ? "text" : "password"}
                      placeholder={t("login.passwordPlaceholder")}
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
                      {t("login.error.invalidPassword")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-900"
                >
                  {t("login.loginButton")}
                </Button>
              </div>
              <div className="text-center text-muted-foreground text-sm">
                {t("login.noAccount")}
                <Link
                  to="/signup"
                  prefetch="intent"
                  className="hover:underline  text-blue-600 hover:text-blue-800"
                >
                  {t("login.signUpLink")}
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
