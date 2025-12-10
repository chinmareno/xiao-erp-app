import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { db } from "~/server/db";
import { sendEmailVerification } from "../email/mailer";
import { LRUCache } from "lru-cache";

const otpRateLimit = new LRUCache<string, { email: string; lastRequest: Date }>(
  {
    max: 5000, // max 5000 IPs tracked
    ttl: 1000 * 60, // reset counts every 60 sec
  }
);

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const record = otpRateLimit.get(email);
        if (record) throw new Error();
        otpRateLimit.set(email, { email, lastRequest: new Date() });
        await sendEmailVerification({ email, otp });
      },
    }),
  ],
  account: { accountLinking: { enabled: true } },
});
