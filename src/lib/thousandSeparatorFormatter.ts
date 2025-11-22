export function thousandSeparatorFormatter(value: string | number): string {
  const stringValue = value.toString();
  const isNegative = stringValue.startsWith("-");
  const clean = stringValue.replace(/\D/g, "");

  const result = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return isNegative ? `-${result}` : result;
}
