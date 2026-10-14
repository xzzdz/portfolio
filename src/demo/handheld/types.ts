export type ScreenName =
  | "login"
  | "home"
  | "area"
  | "tenant"
  | "contract"
  | "payment"
  | "invoices"
  | "history"
  | "meter"
  | "customer"
  | "account"
  | "print";

export type RouteParams = Record<string, string | number | undefined>;

export type Route = { name: ScreenName; params: RouteParams; key: number };

export type PrintJob =
  | { kind: "receipt"; receiptId: string }
  | { kind: "invoice"; invoiceId: string }
  | { kind: "notice"; contractId: string }
  | { kind: "slip"; approvalId: string }
  | { kind: "test" };

export type NotifyType = "success" | "info" | "warning" | "error";

export type ThemeId = "aurora" | "slate" | "sunset" | "emerald" | "midnight";
