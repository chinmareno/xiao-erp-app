export const PONumberFormatter = ({
  prefix,
  currentNumber,
}: {
  prefix: string;
  currentNumber: number;
}) => {
  const formattedPONumber = `${prefix}-${currentNumber
    .toString()
    .padStart(6, "0")}
  `;

  return formattedPONumber;
};
