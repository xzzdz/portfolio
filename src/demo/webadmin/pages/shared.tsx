"use client";

import { Banknote, FileText, History, Loader2, Plus, Printer, QrCode, ReceiptText, Timer, Wallet, Wrench } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { daysBetween, money, shortDate, time } from "@/lib/format";
import { contractStatus, fineOf, invoiceAmount, invoiceState, invoiceSubtotal } from "../../selectors";
import { BankLogo } from "../../shared/BankLogo";
import { ThaiQr } from "../../shared/ThaiQr";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { DocumentModal } from "../ui/Document";
import { Badge, Btn, ChannelBadge, DrawerFrame, Field, InvoiceBadge, ModalFrame, StatusBadge, Tabs } from "../ui/kit";

/** รายละเอียดล็อก (เปิดจากผังพื้นที่) */
export function AreaDrawer({ areaId }: { areaId: string }) {
  const { t, d, lang, openModal, toast, openDrawer } = useAdmin();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const tickets = useDemoStore((s) => s.tickets);
  const area = idx.areaById.get(areaId)!;
  const zone = idx.zoneById.get(area.zoneId)!;
  const status = idx.statusOfArea(area);
  const contract = idx.contractByArea.get(area.id);
  const customer = contract ? idx.customerById.get(contract.customerId) : undefined;
  const ticket = tickets.find((tk) => tk.areaId === areaId && tk.status !== "done");
  const isContract = contract?.kind === "contract";
  const owing = contract ? (idx.invoicesByContract.get(contract.id) ?? []).filter((iv) => !iv.receiptId) : [];

  return (
    <DrawerFrame
      title={`${t("พื้นที่ :")} ${area.name}`}
      subtitle={`${d(zone.name)} · ${t("รหัสพื้นที่")} ${area.code}`}
      headerExtra={<StatusBadge status={status} />}
      footer={
        isContract && customer ? (
          <>
            <Btn variant="outline" icon={History} onClick={() => openDrawer(<TenantDrawer contractId={contract.id} initialTab="bills" />)}>
              {t("ประวัติบิล")}
            </Btn>
            <Btn variant="outline" icon={FileText} disabled={!owing.length} onClick={() => openModal(<DocumentModal kind="invoice" id={owing[0].id} />, { wide: true })}>
              {t("ใบวางบิล")}
            </Btn>
            <Btn icon={Wallet} disabled={!owing.length} onClick={() => openModal(<PaymentModal customerId={customer.id} />)}>
              {t("รับชำระ")}
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon={Plus} onClick={() => toast(t("เปิดฟอร์มเสนอราคา (เดโม่แสดงขั้นตอนหลักเท่านั้น)"), "info")}>
              {t("+ เสนอราคา")}
            </Btn>
            <Btn icon={Plus} onClick={() => toast(t("เปิดฟอร์มทำสัญญา (เดโม่แสดงขั้นตอนหลักเท่านั้น)"), "info")}>
              {t("+ ทำ/ต่อสัญญา")}
            </Btn>
          </>
        )
      }
    >
      {ticket && (
        <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-800">
          <Wrench className="mt-0.5 size-4 shrink-0" />
          <div>
            <b>
              {t("แจ้งซ่อม:")} {d(ticket.title)}
            </b>{" "}
            ({ticket.status === "inProgress" ? t("กำลังดำเนินการ") : t("รอดำเนินการ")})
            <div className="text-red-700/80">
              {t("วันที่แจ้งซ่อม :")} {shortDate(ticket.reportedAt, lang)}
            </div>
          </div>
        </div>
      )}
      <div className="text-[12px] font-bold uppercase tracking-wide text-slate-400">{t("ข้อมูลพื้นที่")}</div>
      <div className="mt-1">
        <Field label={t("โซน")}>{d(zone.name)}</Field>
        <Field label={t("ขนาดพื้นที่(ตร.ม.)")}>{area.sizeSqm}</Field>
        <Field label={t("อัตราค่าเช่า")}>
          ฿{money(area.rate)} / {area.term === "daily" ? t("วัน") : t("เดือน")}
        </Field>
        <Field label={t("มิเตอร์")}>{[area.hasWater && t("น้ำ"), area.hasElectric && t("ไฟ")].filter(Boolean).join(" + ") || "-"}</Field>
      </div>

      {contract && customer && (
        <>
          <div className="mt-5 text-[12px] font-bold uppercase tracking-wide text-slate-400">{isContract ? t("สัญญาปัจจุบัน") : t("ใบเสนอราคา")}</div>
          <div className="mt-1">
            <Field label={t("ชื่อร้านค้า")}>{d(customer.shop)}</Field>
            <Field label={t("ชื่อผู้ติดต่อ")}>{d(customer.name)}</Field>
            <Field label={t("เลขที่สัญญา/เสนอราคา")}>{contract.no}</Field>
            <Field label={t("วันเริ่มสัญญา")}>{shortDate(contract.start, lang)}</Field>
            <Field label={t("วันสิ้นสุดสัญญา")}>
              {shortDate(contract.end, lang)}
              {isContract && <span className="ml-1 text-[11.5px] font-normal text-slate-500">({t("{n} วัน", { n: daysBetween(today, contract.end) })})</span>}
            </Field>
            <Field label={t("เงินประกัน")}>฿{money(contract.deposit)}</Field>
            {contract.cancelDate && <Field label={t("แจ้งยกเลิก ล่วงหน้า")}>{shortDate(contract.cancelDate, lang)}</Field>}
          </div>
          {isContract && (
            <div className="mt-4 rounded-xl bg-[#F4F4EC] p-3 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-slate-500">{t("ยอดค้างชำระ")}</span>
                <b className={owing.length ? "text-red-700" : "text-emerald-700"}>
                  ฿{money(owing.reduce((s, iv) => s + invoiceAmount(iv), 0))} ({t("{n} ใบ", { n: owing.length })})
                </b>
              </div>
            </div>
          )}
        </>
      )}
    </DrawerFrame>
  );
}

/** รายละเอียดผู้เช่า/สัญญา */
export function TenantDrawer({ contractId, initialTab = "info" }: { contractId: string; initialTab?: "info" | "bills" | "pays" }) {
  const { t, d, lang, openModal } = useAdmin();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const market = useDemoStore((s) => s.market);
  const receipts = useDemoStore((s) => s.receipts);
  const contract = idx.contractById.get(contractId)!;
  const customer = idx.customerById.get(contract.customerId)!;
  const [tab, setTab] = useState(initialTab);
  const bills = (idx.invoicesByContract.get(contract.id) ?? []).slice().sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
  const pays = receipts.filter((r) => r.invoiceIds.some((id) => idx.invoiceById.get(id)?.contractId === contract.id)).sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
  const owing = bills.filter((iv) => !iv.receiptId);

  return (
    <DrawerFrame
      title={d(customer.shop)}
      subtitle={`${contract.no} · ${d(customer.name)} · ${customer.phone}`}
      headerExtra={
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={contractStatus(contract, today, market.nearExpireDays)} />
          {contract.areaIds.map((id) => (
            <Badge key={id} tone="leaf">
              {idx.areaById.get(id)?.name}
            </Badge>
          ))}
        </div>
      }
      footer={
        <>
          <Btn variant="outline" icon={Printer} disabled={!owing.length} onClick={() => openModal(<DocumentModal kind="invoice" id={owing[0].id} />, { wide: true })}>
            {t("พิมพ์ใบแจ้งหนี้")}
          </Btn>
          <Btn icon={Wallet} disabled={!owing.length || contract.kind !== "contract"} onClick={() => openModal(<PaymentModal customerId={customer.id} />)}>
            {t("รับชำระ")}
          </Btn>
        </>
      }
    >
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "info", label: t("ข้อมูลการเช่า") },
          { value: "bills", label: t("ใบวางบิล"), count: bills.length },
          { value: "pays", label: t("ประวัติชำระ"), count: pays.length },
        ]}
      />
      <div className="mt-3">
        {tab === "info" && (
          <>
            <Field label={t("ระยะเวลาการเช่า")}>
              {shortDate(contract.start, lang)} – {shortDate(contract.end, lang)}
            </Field>
            <Field label={t("อัตราการคำนวณปัจจุบัน")}>
              ฿{money(contract.rate)} / {contract.term === "daily" ? t("วัน") : t("เดือน")}
            </Field>
            <Field label={t("เงินประกัน")}>฿{money(contract.deposit)}</Field>
            <Field label={t("ประเภท")}>{customer.type === "company" ? t("นิติบุคคล") : t("บุคคลธรรมดา")}</Field>
            <Field label={t("อีเมล")}>{customer.email}</Field>
            <Field label={t("ที่อยู่")}>{d(customer.address)}</Field>
          </>
        )}
        {tab === "bills" && (
          <div className="space-y-2">
            {bills.map((iv) => (
              <button key={iv.id} type="button" onClick={() => openModal(<DocumentModal kind="invoice" id={iv.id} />, { wide: true })} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-50">
                <FileText className="size-4 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-slate-800">{iv.no}</div>
                  <div className="text-[11px] text-slate-500">
                    {t("ครบกำหนด")} {shortDate(iv.dueDate, lang)}
                  </div>
                </div>
                <InvoiceBadge state={invoiceState(iv, today)} />
                <span className="w-24 text-right text-[12.5px] font-bold tabular-nums">฿{money(invoiceAmount(iv))}</span>
              </button>
            ))}
          </div>
        )}
        {tab === "pays" && (
          <div className="space-y-2">
            {pays.length === 0 && <div className="py-6 text-center text-[12.5px] text-slate-500">{t("ไม่พบข้อมูล")}</div>}
            {pays.map((r) => (
              <button key={r.id} type="button" onClick={() => openModal(<DocumentModal kind="receipt" id={r.id} />, { wide: true })} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-50">
                <ReceiptText className="size-4 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-slate-800">{r.no}</div>
                  <div className="text-[11px] text-slate-500">
                    {shortDate(r.paidAt, lang)} {time(r.paidAt)} · {r.staff}
                  </div>
                </div>
                <ChannelBadge channel={r.channel} />
                <span className="w-24 text-right text-[12.5px] font-bold tabular-nums text-emerald-700">฿{money(r.total)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </DrawerFrame>
  );
}

/** รับชำระจากเว็บ : เลือกใบ → ช่องทาง → ยืนยัน (QR ตัดยอดอัตโนมัติ / เงินสด-โอน ออกใบเสร็จทันที) */
export function PaymentModal({ customerId }: { customerId: string }) {
  const { t, d, lang, toast, closeModal, openModal, staff } = useAdmin();
  const idx = useDemoIndex();
  const today = useDemoStore((s) => s.today);
  const accounts = useDemoStore((s) => s.accounts);
  const payInvoices = useDemoStore((s) => s.payInvoices);
  const createIntent = useDemoStore((s) => s.createIntent);
  const customer = idx.customerById.get(customerId)!;
  const invoices = useMemo(() => (idx.invoicesByCustomer.get(customerId) ?? []).filter((iv) => !iv.receiptId && !iv.intentId).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)), [idx, customerId]);
  const [picked, setPicked] = useState<string[]>(() => invoices.filter((iv) => iv.accountId === invoices[0]?.accountId).map((iv) => iv.id));
  const [accountId, setAccountId] = useState(() => invoices[0]?.accountId ?? "acc-cash");
  const [busy, setBusy] = useState(false);
  const selected = invoices.filter((iv) => picked.includes(iv.id));
  const subtotal = selected.reduce((s, iv) => s + invoiceSubtotal(iv), 0);
  const discount = selected.reduce((s, iv) => s + iv.discount, 0);
  const fine = selected.reduce((s, iv) => s + fineOf(iv, today), 0);
  const total = subtotal - discount + fine;
  const account = idx.accountById.get(accountId)!;

  function confirm() {
    setBusy(true);
    window.setTimeout(() => {
      if (account.kind === "promptpay") {
        const intent = createIntent({ invoiceIds: picked, accountId, channel: "web" });
        openModal(<IntentModal intentId={intent.id} />);
      } else {
        const receipt = payInvoices({ invoiceIds: picked, method: account.kind === "cash" ? "cash" : "transfer", accountId, channel: "web", staff: staff.th });
        toast(t("บันทึกรับชำระ {no} เรียบร้อย", { no: receipt.no }), "success");
        openModal(<DocumentModal kind="receipt" id={receipt.id} />, { wide: true });
      }
    }, 600);
  }

  return (
    <ModalFrame
      title={t("รับชำระ")}
      subtitle={`${d(customer.shop)} · ${customer.custNo}`}
      icon={Wallet}
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>
            {t("ยกเลิก")}
          </Btn>
          <Btn icon={busy ? undefined : account.kind === "promptpay" ? QrCode : Banknote} disabled={!picked.length || busy} onClick={confirm}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {account.kind === "promptpay" ? t("สร้าง QR รับชำระ") : t("ยืนยันรับชำระ")} · ฿{money(total)}
          </Btn>
        </>
      }
    >
      {invoices.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-slate-500">{t("ไม่มีใบวางบิลค้างชำระ")}</div>
      ) : (
        <>
          <div className="text-[12px] font-semibold text-slate-500">{t("เลือกรายการ")}</div>
          <div className="mt-2 space-y-1.5">
            {invoices.map((iv) => {
              const on = picked.includes(iv.id);
              const f = fineOf(iv, today);
              return (
                <label key={iv.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-[12.5px]", on ? "border-leaf-500 bg-leaf-50" : "border-slate-200")}>
                  <input type="checkbox" checked={on} onChange={() => setPicked(on ? picked.filter((x) => x !== iv.id) : [...picked, iv.id])} className="size-4 accent-[#6E9B3E]" />
                  <span className="min-w-0 flex-1">
                    <b className="text-slate-800">{iv.no}</b>
                    <span className="block text-[11px] text-slate-500">
                      {t("ครบกำหนด")} {shortDate(iv.dueDate, lang)}
                      {f > 0 && <span className="text-red-600"> · {t("ค่าปรับ")} ฿{money(f)}</span>}
                    </span>
                  </span>
                  <InvoiceBadge state={invoiceState(iv, today)} />
                  <b className="w-24 text-right tabular-nums">฿{money(invoiceAmount(iv))}</b>
                </label>
              );
            })}
          </div>
          <div className="mt-4 text-[12px] font-semibold text-slate-500">{t("รูปแบบชำระ")}</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {accounts.map((a) => (
              <button key={a.id} type="button" onClick={() => setAccountId(a.id)} className={cn("flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left", a.id === accountId ? "border-leaf-500 bg-leaf-50 ring-1 ring-leaf-500" : "border-slate-200 hover:bg-slate-50")}>
                <BankLogo bank={a.bank} size={30} />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-semibold text-slate-800">{d(a.name)}</span>
                  <span className="block truncate text-[11px] text-slate-500">{a.kind === "cash" ? t("ออกใบเสร็จทันที") : a.kind === "promptpay" ? t("QR ตัดยอดอัตโนมัติ") : a.accountNo}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[#F4F4EC] p-3 text-[12.5px]">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">{t("ยอดใบวางบิล")}</span>
              <span className="tabular-nums">฿{money(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-0.5 text-emerald-700">
                <span>{t("ส่วนลด")}</span>
                <span className="tabular-nums">-฿{money(discount)}</span>
              </div>
            )}
            {fine > 0 && (
              <div className="flex justify-between py-0.5 text-red-700">
                <span>{t("ค่าปรับชำระล่าช้า")}</span>
                <span className="tabular-nums">+฿{money(fine)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-slate-300/60 pt-1.5 text-[14px] font-bold">
              <span>{t("ยอดรวม")}</span>
              <span className="tabular-nums">฿{money(total)}</span>
            </div>
          </div>
        </>
      )}
    </ModalFrame>
  );
}

/** QR ของรายการรอชำระ — ระบบตัดยอดให้อัตโนมัติเมื่อมีเงินเข้า */
export function IntentModal({ intentId }: { intentId: string }) {
  const { t, d, openModal, closeModal, toast, staff } = useAdmin();
  const intent = useDemoStore((s) => s.intents.find((i) => i.id === intentId))!;
  const completeIntent = useDemoStore((s) => s.completeIntent);
  const cancelIntent = useDemoStore((s) => s.cancelIntent);
  const idx = useDemoIndex();
  const customer = idx.customerById.get(intent.customerId)!;
  const [left, setLeft] = useState(() => Math.max(0, Math.floor((new Date(intent.expiresAt).getTime() - Date.now()) / 1000)));
  const done = useRef(false);

  useEffect(() => {
    const tick = window.setInterval(() => setLeft(Math.max(0, Math.floor((new Date(intent.expiresAt).getTime() - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(tick);
  }, [intent.expiresAt]);

  useEffect(() => {
    if (intent.status !== "pending") return;
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const receipt = completeIntent(intentId, { staff: staff.th, slipAttached: false });
      if (receipt) {
        toast(t("ได้รับเงินแล้ว — ระบบตัดยอด {no} อัตโนมัติ", { no: receipt.no }), "success");
        openModal(<DocumentModal kind="receipt" id={receipt.id} />, { wide: true });
      }
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [intent.status, intentId, completeIntent, staff.th, toast, t, openModal]);

  return (
    <ModalFrame
      title={t("รายการรอชำระ")}
      subtitle={`${intent.no} · ${d(customer.shop)}`}
      icon={QrCode}
      footer={
        <>
          <Btn
            variant="danger"
            onClick={() => {
              done.current = true;
              cancelIntent(intentId);
              toast(t("ยกเลิกรายการรอชำระแล้ว"), "warning");
              closeModal();
            }}
          >
            {t("ยกเลิกรายการ")}
          </Btn>
          <Btn variant="outline" onClick={closeModal}>
            {t("ปิด (รอชำระต่อ)")}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col items-center">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between bg-[#0E3D66] px-4 py-2 text-white">
            <span className="text-[12px] font-extrabold tracking-[0.12em]">THAI QR PAYMENT</span>
            <span className="rounded bg-white px-1.5 py-px text-[10px] font-extrabold text-[#0E3D66]">PromptPay</span>
          </div>
          <div className="flex flex-col items-center p-5">
            <ThaiQr amount={intent.amount} size={190} />
            <div className="mt-3 text-[12px] text-slate-500">{t("ยอดที่ต้องชำระ")}</div>
            <div className="text-[30px] font-bold tracking-tight">฿{money(intent.amount)}</div>
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-800">
              <Timer className="size-3.5" /> {t("QR ใช้ได้อีก {m}:{s} นาที", { m: String(Math.floor(left / 60)).padStart(2, "0"), s: String(left % 60).padStart(2, "0") })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12.5px] font-semibold text-emerald-700">
          <Loader2 className="size-4 animate-spin" /> {t("รอผู้เช่าสแกนจ่าย — ระบบจะตัดยอดให้อัตโนมัติ")}
        </div>
        <p className="mt-2 text-center text-[11.5px] text-slate-500">{t("รายการนี้จะแสดงที่เครื่อง Handheld ด้วย (หน้า ชำระบิล → รายการรอชำระ)")}</p>
      </div>
    </ModalFrame>
  );
}
