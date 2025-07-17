// components/FormSectionHeader.tsx
type Props = {
  title: string;
  helperText?: string;
  className?: string;
};

export default function FormHeader({
  title,
  helperText,
  className = "mb-6",
}: Props) {
  return (
    <div className={className}>
      <h3 className="text-base sm:text-lg md:text-xl font-semibold ">
        {title}
      </h3>
      {helperText && (
        <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-snug sm:leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
}
