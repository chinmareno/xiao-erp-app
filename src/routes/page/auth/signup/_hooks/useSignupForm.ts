import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "~/lib/auth/auth-client";
import { action } from "../_auth.signup.route";

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

export const useSignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordIsVisible, setConfirmPasswordIsVisible] =
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
    if (error) return toast.error("Too many OTP send. Please try again later.");

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
  return {
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
    OTP,
    setOTP,
    sendOTPCooldown,
    isSendingOTP,
    isCredentialLoading,
    isGoogleLoading,
    signup,
    handleSendOTP,
    signupGoogle,
  };
};
