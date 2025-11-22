export const MODULES_SUBMODULES = {
  PURCHASING: ["supplier", "product", "PO"],
  INVENTORY: ["stock", "transaction", "warehouse"],
  ACCOUNTING: ["invoices", "reports"],
  SALES: ["orders", "customers"],
} as const;
