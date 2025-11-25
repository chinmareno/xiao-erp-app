import { Check, Dot } from "lucide-react";

type Props = {
  password: string;
  oneUpperCase: string;
  oneLowerCase: string;
  includeNumber: string;
  minChar: string;
};

const regex = {
  oneUpperCase: /[A-Z]/,
  oneLowerCase: /[a-z]/,
  includeNumber: /\d/,
};

const PasswordRequirementCheck = ({
  password,
  oneUpperCase,
  oneLowerCase,
  includeNumber,
  minChar,
}: Props) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {regex.oneUpperCase.test(password) ? (
          <Check className="lg:h-4 lg:w-4 text-green-600" />
        ) : (
          <Dot className="lg:h-4 lg:w-4" />
        )}
        <p className="lg:text-sm">{oneUpperCase}</p>
      </div>

      <div className="flex items-center gap-2">
        {regex.oneLowerCase.test(password) ? (
          <Check className="lg:h-4 lg:w-4 text-green-600" />
        ) : (
          <Dot className="lg:h-4 lg:w-4" />
        )}
        <p className="text-sm">{oneLowerCase}</p>
      </div>

      <div className="flex items-center gap-2">
        {regex.includeNumber.test(password) ? (
          <Check className="lg:h-4 lg:w-4 text-green-600" />
        ) : (
          <Dot className="lg:h-4 lg:w-4" />
        )}
        <p className="text-sm">{includeNumber}</p>
      </div>

      <div className="flex items-center gap-2">
        {password.length >= 8 ? (
          <Check className="lg:h-4 lg:w-4 text-green-600" />
        ) : (
          <Dot className="lg:h-4 lg:w-4" />
        )}
        <p className="lg:text-sm">{minChar}</p>
      </div>
    </div>
  );
};

export default PasswordRequirementCheck;
