"use client";

import { CalendarClock, CircleCheck, FileText, Printer, ReceiptText, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { daysBetween, money, shortDate, time } from "@/lib/format";
import { contractStatus, fineOf, invoiceAmount, invoiceState } from "../../selectors";
import { statusLabelTh } from "../../shared/status";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { Button, Card, Checkbox, EmptyState, Pill, Segment, StatusTag, SubHeader } from "../ui/parts";

export function ContractScreen() {
  const { t, d, lang, back, route, go, print, notify } = useApp();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const market = useDemoStore((s) => s.market);
  const receipts = useDemoStore((s) => s.receipts);
  const contract = idx.contractById.get(String(route.params.contractId))!;
  const customer = idx.customerById.get(contract.customerId)!;
  const status = contractStatus(contract, today, market.nearExpireDays);
  const [tab, setTab] = useState<"pay" | "history">("pay");

  const invoices = (idx.invoicesByContract.get(contract.id) ?? []).slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const unpaid = invoices.filter((iv) => invoiceState(iv, today) !== "paid");
  const [picked, setPicked] = useState<string[]>(() => unpaid.filter((iv) => !iv.intentId).map((iv) => iv.id));
  const history = receipts
    .filter((r) => r.invoiceIds.some((id) => idx.invoiceById.get(id)?.contractId === contract.id))
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));

  const total = unpaid.filter((iv) => picked.includes(iv.id)).reduce((sum, iv) => sum + invoiceAmount(iv) + fineOf(iv, today), 0);
  const elapsed = Math.min(100, Math.max(0, (daysBetween(contract.start, today) / Math.max(1, daysBetween(contract.start, contract.end))) * 100));

  return (
    <div className="relative flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader
        title={d(customer.shop)}
        subtitle={contract.no}
        onBack={back}
        right={
          <button
            type="button"
            onClick={() => {
              print({ kind: "notice", contractId: contract.id });
              notify(t("กำลังพิมพ์ใบแจ้งค่าเช่า"), t("{tenantName} — กรุณารอสักครู่", { tenantName: d(customer.shop) }), "info");
            }}
            aria-label={t("พิมพ์ใบแจ้งค่าเช่า")}
            className="grid size-10 place-items-center rounded-full hover:bg-white/10"
          >
            <Printer className="size-5" />
          </button>
        }
      />

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-3">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[12px] text-slate-500">{t("ชื่อผู้เช่า")}</div>
              <div className="truncate text-[15px] font-extrabold text-slate-900">{d(customer.name)}</div>
              <div className="text-[12px] text-slate-500">
                {customer.custNo} · {customer.phone}
              </div>
            </div>
            <StatusTag status={status} label={t(statusLabelTh[status])} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {contract.areaIds.map((id) => (
              <Pill key={id} tone="blue">
                {t("ล็อค {ln}", { ln: idx.areaById.get(id)?.name ?? "" })} · {d(idx.zoneById.get(idx.areaById.get(id)!.zoneId)!.name).split(" ").slice(0, 2).join(" ")}
              </Pill>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[12px] text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5" /> {shortDate(contract.start, lang)}
              </span>
              <span>{shortDate(contract.end, lang)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className={cn("h-full rounded-full", status === "expired" ? "bg-slate-400" : status === "nearExpire" ? "bg-orange-500" : "bg-[#0F52BA]")} style={{ width: `${elapsed}%` }} />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[12.5px]">
              <span className="text-slate-500">
                {contract.term === "daily" ? t("รายวัน") : t("รายเดือน")} · {t("ปกติ")}
              </span>
              <span className="font-extrabold text-slate-900">
                ฿{money(contract.rate)} / {contract.term === "daily" ? t("วัน") : t("เดือน")}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[12px] text-slate-500">
              <span>{t("เงินประกัน")}</span>
              <span>฿{money(contract.deposit)}</span>
            </div>
          </div>
        </Card>

        <Segment
          className="mt-3"
          value={tab}
          onChange={setTab}
          options={[
            { value: "pay", label: `${t("รับชำระ")} (${unpaid.length})`, icon: Wallet },
            { value: "history", label: t("ประวัติบิล"), icon: ReceiptText },
          ]}
        />

        {tab === "pay" ? (
          <div className="mt-3 space-y-2">
            {unpaid.length === 0 ? (
              <EmptyState icon={CircleCheck} title={t("ไม่มีใบวางบิลค้างชำระ")} subtitle={t("ผู้เช่ารายนี้เก็บครบแล้ว")} />
            ) : (
              unpaid.map((iv) => {
                const st = invoiceState(iv, today);
                const fine = fineOf(iv, today);
                const checked = picked.includes(iv.id);
                return (
                  <Card
                    key={iv.id}
                    className={cn("flex items-center gap-3 p-3", checked && "border-[#0F52BA] bg-[#F5F9FF]")}
                    onClick={() => {
                      if (iv.approvalId) return notify(t("แนบสลิปแล้ว รอฝ่ายบัญชีตรวจ"), t("ใบนี้รอการอนุมัติที่เว็บแอดมิน"), "info");
                      if (iv.intentId) return notify(t("มีรายการรอชำระอยู่แล้ว"), t("ใบนี้ผูกกับ QR ที่ออกไว้ — ดูได้ที่หน้าชำระบิล"), "warning");
                      setPicked((p) => (p.includes(iv.id) ? p.filter((x) => x !== iv.id) : [...p, iv.id]));
                    }}
                  >
                    <Checkbox checked={checked} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-bold text-slate-900">{iv.no}</span>
                        {st === "overdue" && <Pill tone="red">{t("เกินกำหนด")}</Pill>}
                        {st === "review" && <Pill tone="violet">{t("รอตรวจสอบ")}</Pill>}
                        {st === "pending" && <Pill tone="amber">{t("รอชำระ (QR)")}</Pill>}
                      </div>
                      <div className="text-[11.5px] text-slate-500">
                        {t("ครบกำหนด {v}", { v: shortDate(iv.dueDate, lang) })}
                        {fine > 0 && <span className="text-red-600"> · {t("ค่าปรับ")} ฿{money(fine)}</span>}
                      </div>
                    </div>
                    <div className="text-right text-[14px] font-extrabold text-slate-900">฿{money(invoiceAmount(iv))}</div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <EmptyState icon={FileText} title={t("ยังไม่มีประวัติการชำระ")} />
            ) : (
              history.map((r) => (
                <Card key={r.id} className="flex items-center gap-3 p-3">
                  <BankLogo bank={idx.accountById.get(r.accountId)?.bank ?? "CASH"} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-slate-900">
                      {r.no}
                      <Pill tone={r.channel === "handheld" ? "violet" : "slate"}>{r.channel === "handheld" ? "Handheld" : "Web"}</Pill>
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                      {shortDate(r.paidAt, lang)} {time(r.paidAt)} · {t(r.method === "cash" ? "เงินสด" : r.method === "qr" ? "QR พร้อมเพย์" : "เงินโอน")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13.5px] font-extrabold text-emerald-700">฿{money(r.total)}</div>
                    <button
                      type="button"
                      onClick={() => {
                        print({ kind: "receipt", receiptId: r.id });
                        notify(t("กำลังพิมพ์..."), r.no, "info");
                      }}
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0F52BA]"
                    >
                      <Printer className="size-3" /> {t("พิมพ์ซ้ำ")}
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {tab === "pay" && unpaid.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 pb-3 pt-2.5 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>{t("เลือกไว้ {picked} ใบ", { picked: picked.length })}</span>
            <span className="text-[17px] font-extrabold text-slate-900">฿{money(total)}</span>
          </div>
          <Button className="mt-2 w-full" icon={Wallet} disabled={!picked.length} onClick={() => go("invoices", { customerId: customer.id, preselect: picked.join(",") })}>
            {t("รับชำระ")}
          </Button>
        </div>
      )}
    </div>
  );
}
