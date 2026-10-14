"use client";

import { AlertTriangle, ArrowLeft, Banknote, Check, CheckCircle2, CircleCheck, Loader2, Printer, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { daysBetween, money, shortDate } from "@/lib/format";
import type { Invoice } from "../../data/types";
import { fineOf, invoiceAmount, invoiceState, invoiceSubtotal } from "../../selectors";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { Button, Card, Checkbox, EmptyState, Pill, SubHeader } from "../ui/parts";
import { IntentQrSheet } from "./IntentQrSheet";

/**
 * โฟลว์ 3 ขั้น : เลือกใบวางบิล → ช่องทางรับเงิน → ยืนยัน
 * ช่องทางตั้งให้อัตโนมัติตามธนาคารที่ออกใบไว้ ("ตามใบวางบิล") เปลี่ยนได้ในขั้นที่ 2
 * ปุ่มยืนยันแค่สร้างรายการรอชำระ + QR — ยังไม่ใช่การรับเงิน
 */
export function InvoicesScreen() {
  const { t, d, lang, back, pop, route, notify, openSheet, openDialog, print, staff } = useApp();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const accounts = useDemoStore((s) => s.accounts);
  const createIntent = useDemoStore((s) => s.createIntent);
  const payInvoices = useDemoStore((s) => s.payInvoices);
  const customerId = String(route.params.customerId);
  const customer = idx.customerById.get(customerId)!;

  const invoices = useMemo(
    () => (idx.invoicesByCustomer.get(customerId) ?? []).filter((iv) => invoiceState(iv, today) !== "paid").sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)),
    [idx, customerId, today],
  );
  const pre = String(route.params.preselect ?? "")
    .split(",")
    .filter(Boolean);

  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<string[]>(() => {
    const ids = pre.length ? pre : invoices.filter((iv) => !iv.intentId).slice(0, 1).map((iv) => iv.id);
    const first = invoices.find((iv) => iv.id === ids[0]);
    return ids.filter((id) => invoices.find((iv) => iv.id === id)?.accountId === first?.accountId);
  });
  const selected = invoices.filter((iv) => picked.includes(iv.id));
  const billAccountId = selected[0]?.accountId ?? invoices[0]?.accountId ?? "acc-cash";
  const [accountId, setAccountId] = useState<string | null>(null);
  const chosenAccountId = accountId ?? billAccountId;
  const chosen = idx.accountById.get(chosenAccountId)!;
  const billAccount = idx.accountById.get(billAccountId)!;
  const [busy, setBusy] = useState(false);

  const subtotal = selected.reduce((s, iv) => s + invoiceSubtotal(iv), 0);
  const discount = selected.reduce((s, iv) => s + iv.discount, 0);
  const fine = selected.reduce((s, iv) => s + fineOf(iv, today), 0);
  const total = subtotal - discount + fine;

  function toggle(iv: Invoice) {
    if (iv.approvalId) return notify(t("แนบสลิปแล้ว รอฝ่ายบัญชีตรวจ"), t("ใบนี้รอการอนุมัติที่เว็บแอดมิน"), "info");
    if (iv.intentId) return notify(t("มีรายการรอชำระอยู่แล้ว"), t("ใบ {docNo} ผูกกับ QR ที่ออกไว้แล้ว", { docNo: iv.no }), "warning");
    if (picked.includes(iv.id)) return setPicked(picked.filter((id) => id !== iv.id));
    if (selected.length && selected[0].accountId !== iv.accountId) {
      return notify(t("เลือกใบนี้ไม่ได้"), t("ใบแยกตามธนาคารที่ออกไว้ เลือกได้ทีละธนาคาร (หนึ่งรายการชำระข้ามธนาคารไม่ได้)"), "warning");
    }
    setPicked([...picked, iv.id]);
    setAccountId(null);
  }

  function confirm() {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (chosen.kind === "cash") {
        const receipt = payInvoices({ invoiceIds: picked, method: "cash", accountId: chosen.id, channel: "handheld", staff: staff.th });
        print({ kind: "receipt", receiptId: receipt.id });
        openDialog(
          <div className="text-center">
            <span className="mx-auto grid size-16 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </span>
            <div className="mt-3 text-[17px] font-extrabold text-slate-900">{t("รับเงินสดเรียบร้อย")}</div>
            <div className="mt-1 text-[13px] text-slate-500">
              {receipt.no} · ฿{money(receipt.total)}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 text-[12px] text-slate-500">
              <Printer className="size-3.5" /> {t("กำลังพิมพ์ใบเสร็จรับเงิน...")}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={pop}
            >
              {t("เสร็จสิ้น")}
            </Button>
          </div>,
        );
      } else {
        const intent = createIntent({ invoiceIds: picked, accountId: chosen.id, channel: "handheld" });
        notify(t("สร้างรายการรอชำระแล้ว"), t("เลขที่ {v}", { v: intent.no }), "success");
        openSheet(<IntentQrSheet intentId={intent.id} onFinished={pop} />, { tall: true });
      }
    }, 650);
  }

  const steps = [t("เลือกรายการ"), t("ช่องทางรับเงิน"), t("ยืนยัน")];

  return (
    <div className="relative flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={d(customer.shop)} subtitle={t("รหัสผู้เช่า {custNo}", { custNo: customer.custNo })} onBack={step > 1 ? () => setStep(step - 1) : back}>
        <div className="mt-2.5 flex items-center gap-1.5 px-2">
          {steps.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className={cn("flex min-w-0 items-center gap-1", n < 3 && "flex-1")}>
                <span className={cn("grid size-[22px] shrink-0 place-items-center rounded-full text-[11px] font-extrabold", done ? "bg-emerald-400 text-white" : active ? "bg-white text-[#0F52BA]" : "bg-white/20 text-white/80")}>
                  {done ? <Check className="size-3.5" /> : n}
                </span>
                <span className={cn("whitespace-nowrap text-[10.5px] font-semibold", active ? "text-white" : "text-white/70")}>{label}</span>
                {n < 3 && <span className="h-px min-w-1.5 flex-1 bg-white/30" />}
              </div>
            );
          })}
        </div>
      </SubHeader>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-36 pt-3">
        {invoices.length === 0 ? (
          <EmptyState icon={CircleCheck} title={t("ไม่มีใบวางบิลค้างชำระ")} subtitle={t("ผู้เช่ารายนี้เก็บครบแล้ว")} />
        ) : step === 1 ? (
          <>
            <div className="mb-2.5 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-[12px] leading-relaxed text-blue-900">
              <b>{t("แตะใบวางบิลที่จะเก็บเงิน")}</b>
              <div className="text-blue-800/80">{t("ใบแยกตามธนาคารที่ออกไว้ เลือกได้ทีละธนาคาร (หนึ่งรายการชำระข้ามธนาคารไม่ได้)")}</div>
            </div>
            <div className="space-y-2">
              {invoices.map((iv) => {
                const st = invoiceState(iv, today);
                const checked = picked.includes(iv.id);
                const f = fineOf(iv, today);
                const late = daysBetween(iv.dueDate, today);
                const contract = idx.contractById.get(iv.contractId);
                const bank = idx.accountById.get(iv.accountId)!;
                return (
                  <Card key={iv.id} onClick={() => toggle(iv)} className={cn("p-3", checked && "border-[#0F52BA] bg-[#F5F9FF]", iv.intentId && "opacity-60")}>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={checked} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[13.5px] font-bold text-slate-900">{iv.no}</span>
                          {st === "overdue" && <Pill tone="red">{t("เกินกำหนด {n} วัน", { n: late })}</Pill>}
                          {st === "review" && <Pill tone="violet">{t("รอตรวจสอบสลิป")}</Pill>}
                          {st === "pending" && <Pill tone="amber">{t("มีรายการรอชำระอยู่แล้ว")}</Pill>}
                        </div>
                        <div className="truncate text-[11.5px] text-slate-500">
                          {t("ล็อค {ln}", { ln: idx.areaNames(iv.areaIds) })} · {t("สัญญา {v}", { v: contract?.no ?? "-" })}
                        </div>
                        <div className="text-[11.5px] text-slate-500">{t("ครบกำหนด {v}", { v: shortDate(iv.dueDate, lang) })}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14.5px] font-extrabold text-slate-900">฿{money(invoiceAmount(iv))}</div>
                        <div className="mt-1 flex items-center justify-end gap-1">
                          <BankLogo bank={bank.bank} size={18} />
                        </div>
                      </div>
                    </div>
                    {(iv.discount > 0 || f > 0) && (
                      <div className="mt-2 flex gap-1.5 border-t border-dashed border-slate-200 pt-2">
                        {iv.discount > 0 && <Pill tone="green">{t("ส่วนลด {v}", { v: money(iv.discount) })}</Pill>}
                        {f > 0 && <Pill tone="red">{t("รวมค่าปรับ {v}", { v: money(f) })}</Pill>}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="mb-1 text-[15px] font-extrabold text-slate-900">{t("เงินจะเข้าบัญชีไหน")}</div>
            <p className="mb-3 text-[12px] leading-relaxed text-slate-500">{t("ระบบเลือกให้ตามธนาคารของใบวางบิลแล้ว — เปลี่ยนได้ถ้าผู้เช่าจะโอนเข้าบัญชีอื่น")}</p>
            <div className="space-y-2">
              {accounts.map((acc) => {
                const active = acc.id === chosenAccountId;
                return (
                  <Card key={acc.id} onClick={() => setAccountId(acc.id)} className={cn("flex items-center gap-3 p-3", active && "border-[#0F52BA] bg-[#F5F9FF] ring-1 ring-[#0F52BA]")}>
                    <BankLogo bank={acc.bank} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900">
                        {d(acc.name)}
                        {acc.id === billAccountId && <Pill tone="blue">{t("ตามใบวางบิล")}</Pill>}
                      </div>
                      <div className="truncate text-[11.5px] text-slate-500">{acc.kind === "cash" ? t("รับเงินสดหน้าแผง · ออกใบเสร็จทันที") : `${d(acc.accountName)} · ${acc.accountNo}`}</div>
                    </div>
                    <span className={cn("grid size-5 place-items-center rounded-full border-2", active ? "border-[#0F52BA]" : "border-slate-300")}>{active && <span className="size-2.5 rounded-full bg-[#0F52BA]" />}</span>
                  </Card>
                );
              })}
            </div>
            {chosenAccountId !== billAccountId && billAccount.kind !== "cash" && (
              <div className="mt-3 flex gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {t("ต่างจากธนาคารที่ออกใบวางบิลไว้ ({v})", { v: d(billAccount.name) })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-3 text-[15px] font-extrabold text-slate-900">{t("ตรวจสอบก่อนสร้างรายการ")}</div>
            <Card className="p-3.5">
              <div className="mb-2 text-[12px] font-bold text-slate-500">{t("รายการที่เลือก ({selected})", { selected: selected.length })}</div>
              {selected.map((iv) => (
                <div key={iv.id} className="flex items-center justify-between border-b border-dashed border-slate-200 py-2 text-[13px] last:border-0">
                  <span>
                    <b className="text-slate-800">{iv.no}</b>
                    <span className="block text-[11px] text-slate-500">
                      {iv.items.map((it) => d(it.label)).join(" · ")}
                    </span>
                  </span>
                  <span className="font-bold">฿{money(invoiceAmount(iv))}</span>
                </div>
              ))}
            </Card>
            <Card className="mt-2.5 p-3.5 text-[13px]">
              <Row label={t("ยอดใบวางบิล")} value={`฿${money(subtotal)}`} />
              {discount > 0 && <Row label={t("ส่วนลดท้ายบิล (หักแล้ว)")} value={`-฿${money(discount)}`} tone="text-emerald-700" />}
              {fine > 0 && <Row label={t("ค่าปรับชำระล่าช้า")} value={`+฿${money(fine)}`} tone="text-red-600" />}
              <div className="mt-2 flex items-end justify-between border-t border-slate-200 pt-2.5">
                <span className="font-bold text-slate-700">{t("รวมที่ต้องชำระ")}</span>
                <span className="text-[22px] font-extrabold tracking-tight text-[#0F52BA]">฿{money(total)}</span>
              </div>
            </Card>
            <Card className="mt-2.5 flex items-center gap-3 p-3.5">
              <BankLogo bank={chosen.bank} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] text-slate-500">{t("รับเงินเข้า")}</div>
                <div className="truncate text-[14px] font-bold text-slate-900">{d(chosen.name)}</div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="text-[12.5px] font-bold text-[#0F52BA]">
                {t("แก้ไข")}
              </button>
            </Card>
          </>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-4 pb-3 pt-2.5 shadow-[0_-6px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>{picked.length ? t("เลือกไว้ {picked} ใบ", { picked: picked.length }) : t("ยังไม่ได้เลือกรายการ")}</span>
            <span className="text-[17px] font-extrabold text-slate-900">฿{money(total)}</span>
          </div>
          <div className="mt-2 flex gap-2">
            {step > 1 && (
              <Button variant="outline" icon={ArrowLeft} onClick={() => setStep(step - 1)} className="w-[38%]">
                {t("ย้อนกลับ")}
              </Button>
            )}
            {step < 3 ? (
              <Button className="flex-1" disabled={!picked.length} onClick={() => setStep(step + 1)}>
                {t("ถัดไป")}
              </Button>
            ) : (
              <Button className="flex-1" variant={chosen.kind === "cash" ? "green" : "primary"} disabled={busy || !picked.length} onClick={confirm} icon={busy ? undefined : chosen.kind === "cash" ? Banknote : QrCode}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? t("กำลังสร้าง...") : chosen.kind === "cash" ? t("ยืนยันรับเงินสด") : t("ยืนยัน · สร้าง QR")}
              </Button>
            )}
          </div>
          {step === 3 && chosen.kind !== "cash" && <p className="mt-1.5 text-center text-[10.5px] text-slate-400">{t("ปุ่มยืนยันแค่สร้างรายการรอชำระ + QR ยังไม่ใช่การรับเงิน")}</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-slate-500">{label}</span>
      <span className={cn("font-semibold text-slate-800", tone)}>{value}</span>
    </div>
  );
}
