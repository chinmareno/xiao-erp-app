import { login } from "./login";
import { signup } from "./signup";

const auth = {
  login: login,
  signup: signup,
  footer: {
    tAndC: "Dengan melanjutkan, kamu menyetujui",
    termsOfService: "Ketentuan Layanan",
    privacyPolicy: "Kebijakan Privasi",
  },
};

export default auth;
