import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  id: string;
  label: string;
  type?: "text" | "password";
  required?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  helperText?: string;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  value?: string | number;
  setValue?: (value: string | number) => void;
};

const InputWithLabel = ({
  id,
  label,
  type = "text",
  required = false,
  error,
  className = "space-y-1",
  inputClassName,
  helperText,
  multiline = false,
  maxLength = 200,
  placeholder,
}: Props) => {
  const [charLeft, setCharLeft] = useState(maxLength);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const remaining = maxLength - e.target.value.length;
    setCharLeft(remaining);
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </Label>
      {multiline ? (
        <>
          <textarea
            id={id}
            name={id}
            maxLength={maxLength || 200}
            rows={4}
            onChange={handleTextareaChange}
            className={`resize-none overflow-hidden bg-transparent w-full border rounded-md p-2 ${inputClassName}`}
          />
          <div className="text-xs text-muted-foreground text-right">
            {charLeft}/{maxLength || 200} characters left
          </div>
        </>
      ) : (
        <Input
          placeholder={placeholder}
          id={id}
          className={inputClassName}
          maxLength={maxLength}
          type={type}
          name={id}
        />
      )}
      {helperText && (
        <p className="text-xs text-muted-foreground italic">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputWithLabel;
