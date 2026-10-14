import {
  Contact,
  Gauge,
  History,
  House,
  Landmark,
  LayoutGrid,
  Printer,
  ReceiptText,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ScreenName } from "./types";

/** ไอคอนประจำเมนู — หน้าแรก ลิ้นชัก และหัวจอใช้ชุดเดียวกัน จะได้จำได้ว่าเป็นหน้าเดียวกัน */
export const appIcons = {
  home: House,
  area: LayoutGrid,
  tenant: Users,
  billing: ReceiptText,
  paymentHistory: History,
  payBill: Wallet,
  meter: Gauge,
  customer: Contact,
  account: Landmark,
  printer: Printer,
} satisfies Record<string, LucideIcon>;

export type NavItem = {
  screen: ScreenName;
  params?: Record<string, string>;
  label: string;
  icon: LucideIcon;
  section: "" | "งานเช่า" | "การเงิน" | "ตั้งค่า";
};

export const navItems: NavItem[] = [
  { screen: "home", label: "หน้าหลัก", icon: appIcons.home, section: "" },
  { screen: "area", label: "พื้นที่เช่า", icon: appIcons.area, section: "งานเช่า" },
  { screen: "tenant", label: "ผู้เช่า", icon: appIcons.tenant, section: "งานเช่า" },
  { screen: "meter", label: "มิเตอร์น้ำไฟฟ้า", icon: appIcons.meter, section: "งานเช่า" },
  { screen: "customer", label: "ทะเบียนลูกค้า", icon: appIcons.customer, section: "งานเช่า" },
  { screen: "payment", label: "ชำระบิล", icon: appIcons.payBill, section: "การเงิน" },
  { screen: "history", params: { tab: "billing" }, label: "ประวัติวางบิล / ชำระ", icon: appIcons.paymentHistory, section: "การเงิน" },
  { screen: "account", label: "บัญชี", icon: appIcons.account, section: "การเงิน" },
  { screen: "print", label: "ตั้งค่าเครื่องพิมพ์", icon: appIcons.printer, section: "ตั้งค่า" },
];
