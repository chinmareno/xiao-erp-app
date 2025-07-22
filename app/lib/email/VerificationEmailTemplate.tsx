import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { SendEmailVerification } from "./mailer";

export const VerificationEmailTemplate = ({
  otp,
  email,
}: SendEmailVerification) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your OTP code for Better Auth</Preview>
      <Container style={container}>
        <Heading style={heading}>Hi {email}!</Heading>

        <Text style={paragraph}>
          Thanks for signing up! Use the OTP code below to verify your email
          address:
        </Text>

        <Section style={otpBoxContainer}>
          <Text style={otpBox}>{otp}</Text>
        </Section>

        <Text style={paragraph}>
          This code is valid for the next 5 minutes. If you didn't request this,
          you can safely ignore it.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>— XiaoERP Team</Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmailTemplate;

// === Styles ===
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const otpBoxContainer = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const otpBox = {
  display: "inline-block",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "4px",
  padding: "12px 24px",
  border: "1px solid #dfe1e4",
  borderRadius: "8px",
  backgroundColor: "#f6f8fa",
  color: "#333",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

const footer = {
  fontSize: "14px",
  color: "#b4becc",
};
