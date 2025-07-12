import "i18next";
import auth from "locales/en/auth";
import common from "locales/en/common";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      auth: typeof auth;
      common: typeof common;
    };
  }
}
