"use client";

import { Camera, CheckCircle2, Copy, Hourglass, ImageIcon, Loader2, Printer, QrCode, RefreshCw, Send, Timer, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { money, shortDate, time } from "@/lib/format";
import { BankLogo } from "../../shared/BankLogo";
import { ThaiQr } from "../../shared/ThaiQr";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { useCountdown } from "../hooks";
import { SheetFrame } from "../ui/Overlays";
import { Button } from "../ui/parts";

/** submitted = ส่งสลิปแล้ว รอฝ่ายบัญชีตรวจที่เว็บแอดมิน */
type Step = "qr" | "slip" | "submitted" | "done";

/**
 * รายการรอชำระ (Payment Intent) : ออก QR → ผู้เช่าสแกนจ่าย → ระบบตัดยอดอัตโนมัติ
 * หรือผู้เช่าโอนเองแล้วแนบสลิป → ระบบอ่านสลิป รอฝ่ายบัญชีอนุมัติบนเว็บ ("ตรวจสอบการชำระเงิน")
 * แล้วใบเสร็จจึงออก — ระหว่างนั้นพิมพ์ "หลักฐานการแนบสลิป" ให้ผู้เช่าถือไว้ได้
 */
export function IntentQrSheet({ intentId, onFinished }: { intentId: string; onFinished?: () => void }) {
  const { t, d, lang, closeSheet, print, notify, staff } = useApp();
  const idx = useDemoIndex();
  const completeIntent = useDemoStore((s) => s.completeIntent);
  const submitSlip = useDemoStore((s) => s.submitSlip);
  const renewIntent = useDemoStore((s) => s.renewIntent);
  const intent = useDemoStore((s) => s.intents.find((it) => it.id === intentId))!;
  const approval = useDemoStore((s) => (intent.approvalId ? s.approvals.find((a) => a.id === intent.approvalId) : undefined));
  const account = idx.accountById.get(intent.accountId)!;
  const customer = idx.customerById.get(intent.customerId)!;
  const { left, m, s } = useCountdown(intent.expiresAt);
  const [step, setStep] = useState<Step>(intent.approvalId ? "submitted" : intent.status === "paid" ? "done" : "qr");
  const [slip, setSlip] = useState(false);
  const [sending, setSending] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(intent.receiptId ?? null);
  const invoiceNos = intent.invoiceIds.map((id) => idx.invoiceById.get(id)?.no).join(", ");

  // ตัดยอดอัตโนมัติ : ระบบรับชำระแจ้งกลับมาว่ามีเงินเข้าแล้ว
  useEffect(() => {
    if (step !== "qr" || left === 0) return;
    const timer = window.setTimeout(() => {
      const receipt = completeIntent(intentId, { staff: staff.th, slipAttached: false });
      if (receipt) {
        setReceiptId(receipt.id);
        setStep("done");
        notify(t("ได้รับเงินแล้ว"), t("ระบบบันทึกการชำระเรียบร้อย"), "success");
      }
    }, 8000);
    return () => window.clearTimeout(timer);
    // นับใหม่เมื่อเปลี่ยนขั้นหรือออก QR ใหม่เท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, intent.expiresAt]);

  function finish() {
    closeSheet();
    onFinished?.();
  }

  function sendSlip(withPrint: boolean) {
    setSending(true);
    window.setTimeout(() => {
      const sent = submitSlip(intentId, { channel: "handheld" });
      setSending(false);
      if (!sent) return;
      setStep("submitted");
      // ใบเสร็จยังไม่ออกจนกว่าฝ่ายบัญชีจะอนุมัติ — พิมพ์หลักฐานการแนบสลิปแทน
      if (withPrint) print({ kind: "slip", approvalId: sent.id });
      notify(t("แนบสลิปไว้แล้ว รอฝ่ายบัญชีตรวจ"), sent.slip.no, "success");
    }, 900);
  }

  const stepper = (
    <div className="flex gap-1 rounded-full bg-slate-100 p-0.5 text-[10.5px] font-bold">
      {(["qr", "slip"] as const).map((k) => (
        <span key={k} className={cn("rounded-full px-2 py-0.5", step === k || (step === "done" && k === "slip") ? "bg-white text-[#0F52BA] shadow-sm" : "text-slate-400")}>
          {k === "qr" ? t("สแกนจ่าย") : t("แนบสลิป")}
        </span>
      ))}
    </div>
  );

  if (step === "submitted" && approval) {
    const approved = approval.status === "completed";
    const rejected = approval.status === "rejected";
    const reading = approval.status === "pending" && Boolean(approval.estimatedAt);
    const receipt = approval.receiptId ? idx.receiptById.get(approval.receiptId) : undefined;
    const Icon = approved ? CheckCircle2 : rejected ? XCircle : Hourglass;
    return (
      <SheetFrame title={approved ? t("ฝ่ายบัญชีอนุมัติแล้ว") : rejected ? t("สลิปถูกปฏิเสธ") : t("ส่งสลิปแล้ว")} subtitle={intent.no} icon={Icon} iconTone={approved ? "green" : rejected ? "red" : "violet"}>
        <div className="flex flex-col items-center pt-3 text-center">
          <span className={cn("relative grid size-20 animate-pop place-items-center rounded-full", approved ? "bg-emerald-100 text-emerald-600" : rejected ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600")}>
            {!approved && !rejected && <span className="absolute inset-0 animate-ping rounded-full bg-violet-200/60 [animation-iteration-count:2]" />}
            <Icon className={cn("relative size-11", !approved && !rejected && "animate-[spin_2.4s_ease-in-out_infinite]")} />
          </span>
          <div className="mt-3 text-[18px] font-extrabold text-slate-900">{approved ? t("อนุมัติแล้ว — ออกใบเสร็จเรียบร้อย") : rejected ? t("ฝ่ายบัญชีปฏิเสธรายการนี้") : t("รอฝ่ายบัญชีตรวจสอบ")}</div>
          <div className="text-[12.5px] text-slate-500">
            {approved ? receipt?.no : rejected ? (approval.note ?? "") : reading ? t("ระบบกำลังอ่านสลิป...") : t("ระบบตรวจสลิปแล้ว — รอกดอนุมัติบนเว็บแอดมิน")}
          </div>
          <div className="mt-4 w-full rounded-2xl bg-slate-50 p-4 text-left text-[13px]">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("เลขที่แนบสลิป")}</span>
              <b>{approval.slip.no}</b>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("ชื่อผู้เช่า")}</span>
              <b className="truncate pl-4">{d(customer.shop)}</b>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("รับเงินเข้า")}</span>
              <b>{d(account.name)}</b>
            </div>
            <div className="mt-1 flex items-end justify-between border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-600">{t("ยอดชำระ")}</span>
              <span className={cn("text-[20px] font-extrabold", approved ? "text-emerald-700" : "text-slate-900")}>฿{money(approval.amount)}</span>
            </div>
          </div>
          {!approved && !rejected && <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">{t("สถานะจะอัปเดตเองเมื่อฝ่ายบัญชีอนุมัติ — ปิดหน้านี้ได้เลย")}</p>}
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          {approved && receipt ? (
            <Button
              variant="outline"
              icon={Printer}
              className="flex-1"
              onClick={() => {
                print({ kind: "receipt", receiptId: receipt.id });
                notify(t("กำลังพิมพ์..."), receipt.no, "info");
              }}
            >
              {t("พิมพ์ใบเสร็จ")}
            </Button>
          ) : (
            !rejected && (
              <Button
                variant="outline"
                icon={Printer}
                className="flex-1"
                onClick={() => {
                  print({ kind: "slip", approvalId: approval.id });
                  notify(t("กำลังพิมพ์..."), approval.slip.no, "info");
                }}
              >
                {t("พิมพ์ใบแนบสลิป")}
              </Button>
            )
          )}
          <Button className="flex-1" onClick={finish}>
            {t("เสร็จสิ้น")}
          </Button>
        </div>
      </SheetFrame>
    );
  }

  if (step === "done") {
    const receipt = receiptId ? idx.receiptById.get(receiptId) : undefined;
    return (
      <SheetFrame title={t("ได้รับเงินแล้ว")} subtitle={intent.no} icon={CheckCircle2} iconTone="green">
        <div className="flex flex-col items-center pt-4 text-center">
          <span className="relative grid size-24 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200/60 [animation-iteration-count:2]" />
            <CheckCircle2 className="relative size-14" />
          </span>
          <div className="mt-4 text-[20px] font-extrabold text-slate-900">{t("ได้รับเงินแล้ว")}</div>
          <div className="text-[13px] text-slate-500">{t("ระบบบันทึกการชำระเรียบร้อย")}</div>
          <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4 text-left text-[13px]">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("ใบเสร็จรับเงิน")}</span>
              <b>{receipt?.no ?? "-"}</b>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("ชื่อผู้เช่า")}</span>
              <b className="truncate pl-4">{d(customer.shop)}</b>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t("รับเงินเข้า")}</span>
              <b>{d(account.name)}</b>
            </div>
            {receipt && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t("วันที่รับชำระ")}</span>
                <b>
                  {shortDate(receipt.paidAt, lang)} {time(receipt.paidAt)}
                </b>
              </div>
            )}
            <div className="mt-1 flex items-end justify-between border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-600">{t("ยอดชำระ")}</span>
              <span className="text-[20px] font-extrabold text-emerald-700">฿{money(receipt?.total ?? intent.amount)}</span>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] text-slate-400">{t("ปิดหน้านี้ได้ รายการนี้ชำระเรียบร้อยแล้ว")}</p>
        </div>
        <div className="mt-4 flex gap-2 pb-2">
          <Button
            variant="outline"
            icon={Printer}
            className="flex-1"
            onClick={() => {
              if (!receipt) return;
              print({ kind: "receipt", receiptId: receipt.id });
              notify(t("กำลังพิมพ์..."), receipt.no, "info");
            }}
          >
            {t("พิมพ์ใบเสร็จ")}
          </Button>
          <Button className="flex-1" onClick={finish}>
            {t("เสร็จสิ้น")}
          </Button>
        </div>
      </SheetFrame>
    );
  }

  if (step === "slip") {
    return (
      <SheetFrame title={t("หลักฐานการโอนเงิน")} subtitle={`${intent.no} · ฿${money(intent.amount)}`} icon={ImageIcon} iconTone="violet" headerRight={stepper}>
        <p className="text-[12.5px] leading-relaxed text-slate-500">{t("ผู้เช่าโอนเองแล้วมีสลิป — ถ่ายรูปสลิปแนบไว้ให้ฝ่ายบัญชีตรวจได้")}</p>
        {slip ? (
          <div className="mt-3">
            <SlipPreview amount={intent.amount} bank={account.bank} accountName={d(account.accountName)} />
            <button type="button" onClick={() => setSlip(false)} className="mt-2 w-full text-center text-[12px] font-bold text-red-600">
              {t("เอาออก")}
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSlip(true)} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-[13px] font-bold text-slate-600 active:bg-slate-100">
              <Camera className="size-7 text-[#0F52BA]" />
              {t("ถ่ายรูปสลิป")}
            </button>
            <button type="button" onClick={() => setSlip(true)} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-[13px] font-bold text-slate-600 active:bg-slate-100">
              <ImageIcon className="size-7 text-violet-600" />
              {t("คลังภาพ")}
            </button>
          </div>
        )}
        <div className="mt-4 space-y-2 pb-2">
          <Button className="w-full" icon={sending ? undefined : Send} disabled={!slip || sending} onClick={() => sendSlip(true)}>
            {sending && <Loader2 className="size-4 animate-spin" />}
            {sending ? t("กำลังส่ง...") : t("ส่งสลิป + พิมพ์ใบ")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("qr")}>
              {t("ย้อนกลับ : QR")}
            </Button>
            <Button variant="ghost" className="flex-1" disabled={!slip || sending} onClick={() => sendSlip(false)}>
              {t("ส่งอย่างเดียว")}
            </Button>
          </div>
        </div>
      </SheetFrame>
    );
  }

  return (
    <SheetFrame title={t("สแกนจ่าย")} subtitle={d(customer.shop)} icon={QrCode} headerRight={stepper}>
      <div className="overflow-hidden rounded-[22px] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between bg-[#0E3D66] px-4 py-2 text-white">
          <span className="text-[12px] font-extrabold tracking-[0.12em]">THAI QR PAYMENT</span>
          <span className="rounded bg-white px-1.5 py-px text-[10px] font-extrabold text-[#0E3D66]">PromptPay</span>
        </div>
        <div className="flex flex-col items-center bg-white px-4 pb-4 pt-4">
          <div className="relative">
            <div className={cn("rounded-xl border border-slate-100 p-2.5 transition", left === 0 && "opacity-15 grayscale")}>
              <ThaiQr amount={intent.amount} size={176} />
            </div>
            {left === 0 && (
              <button
                type="button"
                onClick={() => renewIntent(intentId)}
                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#0F52BA] px-4 py-2 text-[13px] font-bold text-white shadow-lg"
              >
                <RefreshCw className="size-4" /> {t("ออก QR ใหม่")}
              </button>
            )}
          </div>
          <div className="mt-3 text-[11.5px] text-slate-500">{t("ยอดที่ต้องชำระ")}</div>
          <div className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">฿{money(intent.amount)}</div>
          <div className="mt-0.5 text-center text-[11.5px] text-slate-500">{t("{intentNo} · ใบวางบิล {v}", { intentNo: intent.no, v: invoiceNos })}</div>
          <div className="mt-3 flex w-full items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
            <BankLogo bank={account.bank} size={30} />
            <div className="min-w-0 flex-1 text-[12px]">
              <div className="truncate font-bold text-slate-800">{d(account.accountName)}</div>
              <div className="text-slate-500">{account.accountNo}</div>
            </div>
            <button type="button" onClick={() => notify(t("คัดลอกเลขบัญชี"), account.accountNo, "info")} className="grid size-8 place-items-center rounded-lg bg-white text-slate-500 shadow-sm" aria-label={t("คัดลอกเลขบัญชี")}>
              <Copy className="size-4" />
            </button>
          </div>
          <div className={cn("mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold", left === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700")}>
            <Timer className="size-3.5" />
            {left === 0 ? t("QR หมดอายุ") : t("QR ใช้ได้อีก {m}:{s} นาที", { m, s })}
          </div>
        </div>
      </div>

      {left > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-[12.5px] font-semibold text-emerald-700">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          {t("รอผู้เช่าสแกนจ่าย — ระบบจะตัดยอดให้อัตโนมัติ")}
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-slate-50 p-3.5">
        <div className="mb-1.5 text-[13px] font-bold text-slate-800">{t("วิธีชำระเงิน")}</div>
        <ol className="space-y-1.5 text-[12px] leading-relaxed text-slate-600">
          {[t("ให้ผู้เช่าเปิดแอปธนาคาร เลือก \"สแกน\" แล้วสแกน QR ด้านบน"), t("ตรวจชื่อบัญชีปลายทางกับยอดเงินให้ตรงก่อนกดยืนยันโอน"), t("โอนเสร็จแล้วถ่ายรูปสลิปแนบไว้ด้านล่าง ให้ฝ่ายบัญชีตรวจ")].map((line, i) => (
            <li key={line} className="flex gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#0F52BA] text-[10.5px] font-bold text-white">{i + 1}</span>
              {line}
            </li>
          ))}
        </ol>
      </div>
      <Button variant="outline" className="mt-3 w-full" icon={ImageIcon} onClick={() => setStep("slip")}>
        {t("ถัดไป : แนบสลิป")}
      </Button>
    </SheetFrame>
  );
}

/** สลิปโอนเงินตัวอย่าง (แสดงแทนรูปถ่ายจากกล้อง) */
function SlipPreview({ amount, bank, accountName }: { amount: number; bank: string; accountName: string }) {
  const { t } = useApp();
  const [stamp] = useState(() => new Date());
  const ref = `0${stamp.getTime().toString().slice(-11)}`;
  return (
    <div className="mx-auto w-[86%] rotate-[-1.5deg] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-white">
        <div className="text-[11px] opacity-80">{t("โอนเงินสำเร็จ")}</div>
        <div className="text-[13px] font-bold">
          {stamp.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })} {stamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div className="space-y-2 px-4 py-3 text-[11.5px]">
        <div>
          <div className="text-slate-400">{t("จาก")}</div>
          <div className="font-bold text-slate-800">{t("บัญชีผู้เช่า")} · xxx-x-x4821-x</div>
        </div>
        <div>
          <div className="text-slate-400">{t("ไปยัง")}</div>
          <div className="font-bold text-slate-800">
            {accountName} ({bank})
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-dashed border-slate-200 pt-2">
          <span className="text-slate-400">{t("จำนวนเงิน")}</span>
          <span className="text-[16px] font-extrabold text-slate-900">฿{money(amount)}</span>
        </div>
        <div className="text-[10px] text-slate-400">
          {t("เลขที่รายการ")}: {ref}
        </div>
      </div>
    </div>
  );
}
