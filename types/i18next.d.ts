import "i18next";
import auth from "public/locales/en/auth";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      auth: typeof auth;
    };
  }
}
