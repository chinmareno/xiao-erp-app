import { VerificationEmailTemplate } from "./VerificationEmailTemplate";
import { Resend } from "resend";

export type SendEmailVerification = {
  otp: string;
  email: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailVerification = async ({
  otp,
  email,
}: SendEmailVerification) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email to start using XiaoERP",
    react: VerificationEmailTemplate({ otp, email }),
  });
};
