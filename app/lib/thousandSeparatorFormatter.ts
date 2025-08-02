export function thousandSeparatorFormatter(value: string): string {
  const isNegative = value.startsWith("-");
  const clean = value.replace(/\D/g, "");

  const result = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return isNegative ? `-${result}` : result;
}
