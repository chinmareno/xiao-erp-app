import { login } from "./login";
import { signup } from "./signup";

const auth = {
  login: login,
  signup: signup,
  footer: {
    tAndC: "By clicking continue, you agree to our",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
  },
};

export default auth;
