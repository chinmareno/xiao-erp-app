export function thousandSeparatoFormatter(value: string): string {
  const clean = value.replace(/\D/g, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
