import { ActionFunctionArgs } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  Link,
  redirect,
  useActionData,
} from "@remix-run/react";
import { Check, Dot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaApple } from "react-icons/fa";
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawFormData = Object.fromEntries(formData);
  const result = signupSchema.safeParse(rawFormData);
  if (result.success) {
    return redirect("/dashboard");
  } else {
    return result.error.format();
  }
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const rawFormData = Object.fromEntries(formData);
  const result = signupSchema.safeParse(rawFormData);
  if (result.success) {
    return await serverAction();
  } else {
    return result.error.format();
  }
}

export default function SignupForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { t } = useTranslation(["auth", "common"]);
  const errors = useActionData<typeof action>();

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
          <Form method="post" replace className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <FcGoogle className="h-6 w-6 flex-shrink-0" />
                  {t("signup.googleButton")}
                </Button>
                <Button variant="outline" className="w-full">
                  <FaApple />
                  {t("signup.appleButton")}
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
                    name="email"
                    type="text"
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
                  <Input
                    id="password"
                    name="password"
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    value={password}
                    type="password"
                    placeholder={t("signup.passwordPlaceholder")}
                  />
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
                  <Label htmlFor="password">
                    {t("signup.confirmPasswordLabel")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                    value={confirmPassword}
                    type="password"
                    placeholder={t("signup.confirmPasswordLabel")}
                  />
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
                  to={"#"}
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
