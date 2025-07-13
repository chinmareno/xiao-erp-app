import { Locale } from "../locales.server";
import auth from "./auth";
import common from "./common";

export default { auth: auth, common: common } satisfies Locale;
