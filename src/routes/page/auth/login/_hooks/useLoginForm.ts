import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "~/lib/auth/auth-client";

export type LoginError = {
  email: boolean;
  password: boolean;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [errors, setErrors] = useState<LoginError | null>(null);
  const [isCredentialLoading, setIsCredentialLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (isCredentialLoading) return;
    const result = loginSchema.safeParse({ email, password });

    if (result.success) {
      setErrors(null);
      setIsCredentialLoading(true);

      await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: () => {
            navigate("/");
          },
          onError: (ctx) => {
            setIsCredentialLoading(true);
            toast.error(ctx.error.message);
          },
        },
      });
    } else {
      const { email, password } = result.error.format();
      setErrors({
        email: !!email,
        password: !!password,
      });
    }
    setIsCredentialLoading(false);
  };

  const signupGoogle = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);

    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/login",
    });
  };

  return {
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
  };
};
