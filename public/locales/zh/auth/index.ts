import { login } from "./login";
import { signup } from "./signup";

const auth = {
  login: login,
  signup: signup,
  footer: {
    tAndC: "点击继续，即表示您同意我们的",
    termsOfService: "服务条款",
    privacyPolicy: "隐私政策",
  },
};

export default auth;
