export const MODULES_SUBMODULES = {
  ACCOUNTING: ["invoices", "reports"],
  SALES: ["orders", "customers"],
  INVENTORY: ["stock", "transfers"],
  PURCHASING: ["supplier", "POs"],
} as const;
