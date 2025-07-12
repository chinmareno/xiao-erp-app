import "i18next";
import auth from "public/locales/en/auth";
import common from "public/locales/en/common";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      auth: typeof auth;
      common: typeof common;
    };
  }
}
