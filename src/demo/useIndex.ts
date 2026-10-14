"use client";

import { useMemo } from "react";
import { buildIndex } from "./selectors";
import { useDemoStore } from "./store";

/** ดัชนีของข้อมูลทั้งหมด — สร้างใหม่เฉพาะตอนข้อมูลชุดไหนเปลี่ยน */
export function useDemoIndex() {
  const areas = useDemoStore((s) => s.areas);
  const zones = useDemoStore((s) => s.zones);
  const customers = useDemoStore((s) => s.customers);
  const contracts = useDemoStore((s) => s.contracts);
  const invoices = useDemoStore((s) => s.invoices);
  const receipts = useDemoStore((s) => s.receipts);
  const accounts = useDemoStore((s) => s.accounts);
  const meters = useDemoStore((s) => s.meters);
  const intents = useDemoStore((s) => s.intents);
  const market = useDemoStore((s) => s.market);
  const today = useDemoStore((s) => s.today);
  return useMemo(
    () => buildIndex({ areas, zones, customers, contracts, invoices, receipts, accounts, meters, intents, market, today }),
    [areas, zones, customers, contracts, invoices, receipts, accounts, meters, intents, market, today],
  );
}
