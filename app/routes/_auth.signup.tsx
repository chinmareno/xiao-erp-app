import { Form, Link, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { Check, Dot, Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
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
import type { loader as localesLoader } from "../root";
import { toast } from "sonner";

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

  const t = useRouteLoaderData<typeof localesLoader>("root");
  const scopedT = t?.auth;

  const navigate = useNavigate();

  const signup = async () => {
    const result = signupSchema.safeParse({ email, password, confirmPassword });

    if (result.success) {
      setErrors(null);

      const name = email.split("@")[0];

      await authClient.signUp.email({
        email,
        password,
        name,
        fetchOptions: {
          onSuccess: () => {
            navigate("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      });
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
      disableRedirect: true,
      fetchOptions: {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

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
              <div className="flex flex-col gap-4">
                <Button
                  onClick={signupGoogle}
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  <FcGoogle className="h-6 w-6 flex-shrink-0" />
                  {scopedT?.signup.googleButton}
                </Button>
              </div>
              <div className="relative text-center lg:text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  {scopedT?.signup.separator}
                </span>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{scopedT?.signup.emailLabel}</Label>
                  <Input
                    id="email"
                    type="text"
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    value={email}
                    placeholder={scopedT?.signup.emailPlaceholder}
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-600">
                      {scopedT?.signup.error.invalidEmail}
                    </p>
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
                        {scopedT?.signup.passwordRequirement.oneLowerCase}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(password) ? (
                        <Check className="lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Dot className="lg:h-4 lg:w-4" />
                      )}
                      <p className="text-sm">
                        {scopedT?.signup.passwordRequirement.oneUpperCase}
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
                <div>
                  <Label htmlFor="confirmPassword">
                    {scopedT?.signup.confirmPasswordLabel}
                  </Label>
                  <div className="relative flex">
                    <Input
                      id="confirmPassword"
                      onChange={(e) =>
                        setConfirmPassword(e.currentTarget.value)
                      }
                      value={confirmPassword}
                      type={confirnPasswordIsVisible ? "text" : "password"}
                      placeholder={scopedT?.signup.confirmPasswordLabel}
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
                      {scopedT?.signup.error.invalidConfirmPassword}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-900"
                >
                  {scopedT?.signup.signupButton}
                </Button>
              </div>
              <div className="text-center text-muted-foreground text-sm">
                {scopedT?.signup.haveAccount}
                <Link
                  to="/login"
                  prefetch="intent"
                  className="hover:underline  text-blue-600 hover:text-blue-800"
                >
                  {scopedT?.signup.loginLink}
                </Link>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <div className=" text-xs text-center mt-1.5 text-muted-foreground">
        {scopedT?.footer.tAndC}
        <Link
          className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
          to={"#"}
        >
          {scopedT?.footer.termsOfService}
        </Link>{" "}
        {t?.common.and}{" "}
        <Link
          className="underline text-blue-600 underline-offset-4 hover:text-blue-800"
          to={"#"}
        >
          {t?.auth.footer.privacyPolicy}
        </Link>
      </div>
    </div>
  );
}
