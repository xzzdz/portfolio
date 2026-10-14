"use client";

import { ChevronRight, CircleCheck, Clock, QrCode, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { fineOf, invoiceAmount, invoiceState } from "../../selectors";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { useCountdown } from "../hooks";
import { Card, EmptyState, Pill, SubHeader } from "../ui/parts";
import { IntentQrSheet } from "./IntentQrSheet";

export function PaymentScreen() {
  const { t, d, go, openSheet } = useApp();
  const idx = useDemoIndex();
  const invoices = useDemoStore((s) => s.invoices);
  const intents = useDemoStore((s) => s.intents);
  const today = useDemoStore((s) => s.today);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, { customerId: string; count: number; total: number; overdue: number; areaIds: Set<string> }>();
    for (const iv of invoices) {
      const st = invoiceState(iv, today);
      if (st === "paid") continue;
      const g = map.get(iv.customerId) ?? { customerId: iv.customerId, count: 0, total: 0, overdue: 0, areaIds: new Set<string>() };
      g.count++;
      g.total += invoiceAmount(iv) + fineOf(iv, today);
      if (st === "overdue") g.overdue++;
      iv.areaIds.forEach((id) => g.areaIds.add(id));
      map.set(iv.customerId, g);
    }
    return [...map.values()].sort((a, b) => b.overdue - a.overdue || b.total - a.total);
  }, [invoices, today]);

  const q = query.trim().toLowerCase();
  const visible = groups.filter((g) => {
    if (!q) return true;
    const c = idx.customerById.get(g.customerId)!;
    return [c.shop.th, c.shop.en, c.name.th, c.name.en, c.custNo, idx.areaNames([...g.areaIds])].some((v) => v.toLowerCase().includes(q));
  });
  const pending = intents.filter((it) => it.status === "pending");
  const grand = groups.reduce((sum, g) => sum + g.total, 0);

  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("ชำระบิล")}>
        <div className="mt-2 flex items-end justify-between px-2">
          <div>
            <div className="text-[11px] text-white/75">{t("ยอดค้างชำระทั้งสาขา")}</div>
            <div className="text-[22px] font-extrabold tracking-tight">฿{money(grand)}</div>
          </div>
          <div className="text-right text-[11.5px] text-white/80">
            {t("{n} ราย", { n: groups.length })} · {t("{n} ใบ", { n: groups.reduce((s, g) => s + g.count, 0) })}
          </div>
        </div>
      </SubHeader>

      <div className="shrink-0 px-3 pb-1 pt-3">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#0F52BA]">
          <Search className="size-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ค้นหาผู้เช่า / ร้าน / ล็อก")} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="clear">
              <X className="size-4 text-slate-400" />
            </button>
          )}
        </label>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 pb-24 pt-2">
        {pending.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-amber-800">
              <QrCode className="size-4" /> {t("รายการรอชำระ")} ({pending.length})
            </div>
            <div className="space-y-2">
              {pending.map((it) => (
                <PendingRow key={it.id} intentId={it.id} onOpen={() => openSheet(<IntentQrSheet intentId={it.id} />, { tall: true })} />
              ))}
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <EmptyState icon={CircleCheck} title={t("ไม่มีใบวางบิลค้างชำระ")} subtitle={q ? t("ไม่พบผู้เช่าที่ตรงกับคำค้น") : t("ทุกผู้เช่าชำระครบแล้ว")} />
        ) : (
          visible.map((g) => {
            const c = idx.customerById.get(g.customerId)!;
            const areas = [...g.areaIds];
            return (
              <Card key={g.customerId} className="flex items-center gap-3 p-3.5" onClick={() => go("invoices", { customerId: g.customerId })}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[13px] font-extrabold text-[#0F52BA]">{idx.areaById.get(areas[0])?.name}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-extrabold text-slate-900">{d(c.shop)}</div>
                  <div className="truncate text-[11.5px] text-slate-500">
                    {d(c.name)} · {t("ล็อค {ln}", { ln: idx.areaNames(areas) })}
                  </div>
                  <div className="mt-1 flex gap-1">
                    <Pill tone="slate">{t("{n} ใบ", { n: g.count })}</Pill>
                    {g.overdue > 0 && <Pill tone="red">{t("เกินกำหนด {n}", { n: g.overdue })}</Pill>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-extrabold text-slate-900">฿{money(g.total)}</div>
                  <ChevronRight className="ml-auto size-4 text-slate-400" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function PendingRow({ intentId, onOpen }: { intentId: string; onOpen: () => void }) {
  const { t, d } = useApp();
  const idx = useDemoIndex();
  const intent = idx.intentById.get(intentId)!;
  const c = idx.customerById.get(intent.customerId)!;
  const { left, m, s } = useCountdown(intent.expiresAt);
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-left shadow-sm">
      <QrCode className="size-5 text-amber-600" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-slate-900">{d(c.shop)}</span>
        <span className="block text-[11px] text-slate-500">{intent.no}</span>
      </span>
      <span className="text-right">
        <span className="block text-[13px] font-extrabold">฿{money(intent.amount)}</span>
        <span className="flex items-center justify-end gap-1 text-[10.5px] font-semibold text-amber-700">
          <Clock className="size-3" /> {left > 0 ? `${m}:${s}` : t("QR หมดอายุ")}
        </span>
      </span>
    </button>
  );
}
