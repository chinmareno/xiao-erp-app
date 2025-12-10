import { VerificationEmailTemplate } from "./VerificationEmailTemplate";
import nodemailer from "nodemailer";
import ReactDOMServer from "react-dom/server";

export type SendEmailVerification = {
  otp: string;
  email: string;
};

export const sendEmailVerification = async ({
  otp,
  email,
}: SendEmailVerification) => {
  const googleEmail = process.env.GOOGLE_APP_EMAIL;
  const googlePassword = process.env.GOOGLE_APP_PASSWORD;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleEmail,
      pass: googlePassword,
    },
  });
  const html = ReactDOMServer.renderToStaticMarkup(
    VerificationEmailTemplate({ otp, email })
  );

  await transporter.sendMail({
    from: `Xiao Erp Team <${googleEmail}>`, // sender address
    to: email, // list of receivers
    subject: "Signup OTP Verification", // Subject line
    text: `OTP: ${otp}.If you don't request it, just ignore.`, // plain text body
    html: html, // html body
  });
};
