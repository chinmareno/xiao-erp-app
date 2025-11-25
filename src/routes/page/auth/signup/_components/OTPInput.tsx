import { Loader2 } from "lucide-react";
import { SetStateAction } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
  label: string | undefined;
  placeholder: string | undefined;
  OTP: string;
  setOTP: (OTP: SetStateAction<string>) => void;
  handleSendOTP: () => Promise<string | number | undefined>;
  sendOTPCooldown: number;
  isSendingOTP: boolean;
  email: string;
  errorMessage: string | undefined;
  sendOtp: string | undefined;
  wait: string | undefined;
};

export const OTPInput = ({
  label,
  OTP,
  setOTP,
  handleSendOTP,
  sendOTPCooldown,
  isSendingOTP,
  email,
  errorMessage,
  sendOtp,
  wait,
  placeholder,
}: Props) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="OTP">{label || "Enter OTP"}</Label>
      <div className="relative ">
        <Input
          id="OTP"
          type="text"
          onChange={(e) => setOTP(e.currentTarget.value)}
          value={OTP}
          className="font-semibold"
          placeholder={placeholder || "6 digit code"}
          maxLength={6}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleSendOTP}
          disabled={
            sendOTPCooldown > 0 ||
            isSendingOTP ||
            !z.string().email().safeParse(email).success
          }
          className="absolute z-50 right-0 bottom-0"
        >
          {isSendingOTP ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : sendOTPCooldown > 0 ? (
            `${wait || "Wait"} ${sendOTPCooldown}`
          ) : (
            `${sendOtp || "Send OTP"}`
          )}
        </Button>
      </div>
      <p className="text-sm text-red-600">{errorMessage}</p>
    </div>
  );
};
