"use client";

// ชิ้นส่วนของหน้า "ตรวจสอบการชำระเงิน" : ป้ายคะแนน/สถานะ, ตัวดูสลิป, ไดอะล็อกตรวจสลิป,
// อัปโหลด Bank Statement และประวัติอัปโหลด — โครงตามหน้าจริง (UP_Excel_V2)

import {
  ArrowDown,
  BadgeCheck,
  Ban,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  Expand,
  FileSpreadsheet,
  History,
  Landmark,
  Loader2,
  Minimize2,
  ReceiptText,
  RotateCcw,
  RotateCw,
  Timer,
  TriangleAlert,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { money, shortDate, time } from "@/lib/format";
import type { Approval, CheckResult, ConfidenceStatus, SlipInfo } from "../../data/types";
import { invoiceAmount } from "../../selectors";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { amountDiff, isProcessing, maskAccount, STATEMENT_ACCEPT, statementPatterns } from "../../verify";
import { useAdmin } from "../AdminContext";
import { DocumentModal } from "../ui/Document";
import { Badge, Btn, ChannelBadge } from "../ui/kit";

// ─────────────────────────── เวลา ───────────────────────────

/** เวลาปัจจุบันที่อัปเดตเป็นระยะ — ใช้กับป้ายนับถอยหลัง/รอมาแล้วกี่นาที */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** ชื่อพนักงานที่บันทึกไว้เป็นภาษาไทย → แสดงตามภาษาของหน้าจอ */
export function useStaffName() {
  const { d } = useAdmin();
  const staff = useDemoStore((s) => s.staff);
  return (th?: string) => {
    const found = staff.find((u) => u.name.th === th);
    return found ? d(found.name) : (th ?? "-");
  };
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

// ─────────────────────────── ป้าย ───────────────────────────

export const confidenceMeta: Record<ConfidenceStatus, { label: string; tone: "green" | "amber" | "red" | "blue" }> = {
  verified_match: { label: "ตรงกันยืนยันแล้ว", tone: "green" },
  review_recommended: { label: "แนะนำให้ตรวจสอบ", tone: "amber" },
  needs_inspection: { label: "ต้องตรวจสอบ", tone: "red" },
  pending: { label: "รอตรวจสอบ", tone: "blue" },
};

const scoreColor = (n: number) => (n >= 80 ? "#047857" : n >= 50 ? "#B45309" : "#B91C1C");

/** คะแนนความมั่นใจ : แถบสั้น + ตัวเลข + คำอธิบาย (สีเป็นตัวช่วย ข้อความคือความหมายหลัก) */
export function ConfidenceCell({ approval, compact }: { approval: Approval; compact?: boolean }) {
  const { t } = useAdmin();
  const meta = confidenceMeta[approval.confidenceStatus];
  if (approval.confidence === null) {
    return (
      <Badge tone="blue" icon={isProcessing(approval) ? Loader2 : Timer} className={isProcessing(approval) ? "[&>svg]:animate-spin" : undefined}>
        {t(isProcessing(approval) ? "กำลังอ่านสลิป" : meta.label)}
      </Badge>
    );
  }
  return (
    <div className={cn("min-w-[124px]", compact && "min-w-0")}>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full" style={{ width: `${approval.confidence}%`, background: scoreColor(approval.confidence) }} />
        </span>
        <b className="tabular-nums text-[12.5px]" style={{ color: scoreColor(approval.confidence) }}>
          {approval.confidence}%
        </b>
      </div>
      {!compact && <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{t(meta.label)}</div>}
    </div>
  );
}

export function ConfidenceChip({ approval }: { approval: Approval }) {
  const { t } = useAdmin();
  const meta = confidenceMeta[approval.confidenceStatus];
  return (
    <Badge tone={meta.tone} icon={approval.confidenceStatus === "verified_match" ? BadgeCheck : approval.confidenceStatus === "pending" ? Timer : TriangleAlert}>
      {t(meta.label)}
      {approval.confidence !== null && <span className="tabular-nums">· {approval.confidence}%</span>}
    </Badge>
  );
}

export function ApprovalStatusChip({ approval }: { approval: Approval }) {
  const { t } = useAdmin();
  if (approval.status === "completed") return <Badge tone="green" icon={Check}>{t("อนุมัติแล้ว")}</Badge>;
  if (approval.status === "rejected") return <Badge tone="red" icon={Ban}>{t("ปฏิเสธแล้ว")}</Badge>;
  if (isProcessing(approval)) return <Badge tone="blue">{t("กำลังดำเนินการ")}</Badge>;
  return <Badge tone="amber">{t("รออนุมัติ")}</Badge>;
}

/** ชิปนับถอยหลัง "ระบบจะตรวจเสร็จใน" — มีเฉพาะตอนที่ยังนับอยู่ */
export function ReviewCountdownPill({ approval, now }: { approval: Approval; now: number }) {
  const { t } = useAdmin();
  if (!approval.estimatedAt || approval.status !== "pending") return null;
  const left = Math.ceil((Date.parse(approval.estimatedAt) - now) / 1000);
  if (left <= 0) return null;
  return (
    <Badge tone="blue" icon={Timer}>
      <span className="tabular-nums">{t("ตรวจเสร็จใน {v}", { v: mmss(left) })}</span>
    </Badge>
  );
}

/** รอตรวจมาแล้วนานเท่าไร — เกิน 1 ชม. เป็นสีส้ม เกิน 1 วันเป็นสีแดง */
export function PendingDuration({ approval, now }: { approval: Approval; now: number }) {
  const { t } = useAdmin();
  const minutes = Math.max(0, Math.floor((now - Date.parse(approval.createdAt)) / 60_000));
  const label =
    minutes < 1 ? t("เมื่อสักครู่") : minutes < 60 ? t("รอ {m} นาที", { m: minutes }) : minutes < 1440 ? t("รอ {h} ชม. {m} นาที", { h: Math.floor(minutes / 60), m: minutes % 60 }) : t("รอ {d} วัน {h} ชม.", { d: Math.floor(minutes / 1440), h: Math.floor((minutes % 1440) / 60) });
  const tone = minutes >= 1440 ? "text-red-700" : minutes >= 60 ? "text-amber-700" : "text-slate-500";
  return <span className={cn("text-[11px] font-semibold tabular-nums", tone)}>{label}</span>;
}

// ─────────────────────────── สลิป ───────────────────────────

const SLIP_W = 264;
const SLIP_H = 476;
const VIEW_W = 330;
const VIEW_H = 480;
/** ความสูงที่แถบเครื่องมือลอยกินพื้นที่ด้านบน (top 8 + ปุ่ม 42) — ตอนพอดีกรอบวางสลิปไว้ใต้แถบ ไม่ให้บังหัวสลิป */
const TOOLBAR_H = 50;
const FIT_PAD = 10;

/** สลิปโอนเงิน (ภาพที่ผู้เช่าแนบมา) */
export function SlipImage({ slip }: { slip: SlipInfo }) {
  const { t, d, lang } = useAdmin();
  const header = { KBANK: "#138F2D", SCB: "#4E2A84", BBL: "#1E4598", KTB: "#1BA5E1", PROMPTPAY: "#0B3D6E", CASH: "#16A34A" }[slip.senderBank];
  return (
    <div className="flex select-none flex-col overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl" style={{ width: SLIP_W, height: SLIP_H }}>
      <div className="flex items-center gap-2.5 px-4 py-3 text-white" style={{ background: header }}>
        <BankLogo bank={slip.senderBank} size={30} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13.5px] font-bold">{t("โอนเงินสำเร็จ")}</div>
          <div className="text-[10.5px] opacity-85">
            {shortDate(slip.at, lang)} · {time(slip.at)} {lang === "th" ? "น." : ""}
          </div>
        </div>
        <CheckCircle2 className="size-6" />
      </div>
      <div className="flex flex-1 flex-col px-4 py-3.5 text-[11.5px]">
        <SlipParty label={t("จาก")} bank={slip.senderBank} name={d(slip.senderName)} account={slip.senderAccount} />
        <ArrowDown className="my-1.5 ml-3 size-4 text-slate-300" />
        <SlipParty label={t("ไปยัง")} bank={slip.receiverBank} name={d(slip.receiverName)} account={slip.receiverAccount} />
        <div className="mt-4 border-t border-dashed border-slate-200 pt-3">
          <div className="text-slate-400">{t("จำนวนเงิน")}</div>
          <div className="text-[24px] font-extrabold leading-tight tracking-tight">
            {money(slip.amount)} <span className="text-[13px] font-semibold text-slate-500">{t("บาท")}</span>
          </div>
          <div className="mt-0.5 text-[10.5px] text-slate-400">{t("ค่าธรรมเนียม")} 0.00 {t("บาท")}</div>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400">{t("เลขที่รายการ")}</div>
            <div className="break-all font-mono text-[10.5px] font-semibold text-slate-700">{slip.ref}</div>
          </div>
          <QRCodeSVG value={`SLIP|${slip.ref}|${slip.amount.toFixed(2)}`} size={58} marginSize={0} />
        </div>
      </div>
    </div>
  );
}

function SlipParty({ label, bank, name, account }: { label: string; bank: SlipInfo["senderBank"]; name: string; account: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <BankLogo bank={bank} size={32} />
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400">{label}</div>
        <div className="truncate font-bold text-slate-800">{name}</div>
        <div className="font-mono text-[10.5px] text-slate-500">{account}</div>
      </div>
    </div>
  );
}

/**
 * ตัวดูสลิป — ปุ่มลอยมุมขวาบน : ขยาย | ย่อ | เต็มกรอบ/พอดี | หมุน 90° | รีเซ็ต
 * ซูมทีละ 25% ช่วง 100–300% ลากเลื่อนได้เฉพาะตอนซูมเกิน 100% (กติกาเดียวกับ _SlipZoomView ของระบบจริง)
 */
export function SlipViewer({ slip }: { slip: SlipInfo }) {
  const { t } = useAdmin();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cover, setCover] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const sideways = rotation % 180 !== 0;
  const w = sideways ? SLIP_H : SLIP_W;
  const h = sideways ? SLIP_W : SLIP_H;
  const fit = Math.min((VIEW_W - FIT_PAD * 2) / w, (VIEW_H - TOOLBAR_H - FIT_PAD) / h);
  const fill = Math.max(VIEW_W / w, VIEW_H / h);
  const scale = (cover ? fill : fit) * zoom;
  const canPan = zoom > 1 || cover;
  // จุดกึ่งกลางของพื้นที่ใต้แถบเครื่องมือ (เต็มกรอบใช้กึ่งกลางกรอบตามเดิม)
  const offsetY = cover ? 0 : (TOOLBAR_H - FIT_PAD) / 2;

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setCover(false);
    setPan({ x: 0, y: 0 });
  };
  const tools: { icon: LucideIcon; label: string; onClick: () => void; disabled?: boolean }[] = [
    { icon: ZoomIn, label: t("ขยาย"), onClick: () => setZoom((z) => Math.min(3, z + 0.25)), disabled: zoom >= 3 },
    {
      icon: ZoomOut,
      label: t("ย่อ"),
      onClick: () => {
        const next = Math.max(1, zoom - 0.25);
        setZoom(next);
        if (next === 1 && !cover) setPan({ x: 0, y: 0 });
      },
      disabled: zoom <= 1,
    },
    { icon: cover ? Minimize2 : Expand, label: cover ? t("พอดีกรอบ") : t("เต็มกรอบ"), onClick: () => { setCover((c) => !c); setPan({ x: 0, y: 0 }); } },
    { icon: RotateCw, label: t("หมุน 90°"), onClick: () => { setRotation((r) => r + 90); setPan({ x: 0, y: 0 }); } },
    { icon: RotateCcw, label: t("รีเซ็ต"), onClick: reset },
  ];

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-slate-900 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:14px_14px]", canPan ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
      style={{ width: VIEW_W, height: VIEW_H, touchAction: "none" }}
      onPointerDown={(e) => {
        if (!canPan) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      }}
      onPointerMove={(e) => {
        const start = drag.current;
        if (!start) return;
        setPan({ x: start.px + e.clientX - start.x, y: start.py + e.clientY - start.y });
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <div
        className="absolute left-1/2 top-1/2 transition-transform duration-200 ease-out"
        style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y + offsetY}px)) rotate(${rotation}deg) scale(${scale})` }}
      >
        <SlipImage slip={slip} />
      </div>
      <div className="absolute right-2 top-2 flex gap-1 rounded-xl bg-black/55 p-1 backdrop-blur-sm" onPointerDown={(e) => e.stopPropagation()}>
        {tools.map((tool) => (
          <button key={tool.label} type="button" title={tool.label} aria-label={tool.label} disabled={tool.disabled} onClick={tool.onClick} className="grid h-[34px] w-[38px] place-items-center rounded-lg text-white transition hover:bg-white/15 disabled:opacity-35">
            <tool.icon className="size-[18px]" />
          </button>
        ))}
      </div>
      <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">{Math.round(zoom * 100)}%</span>
    </div>
  );
}

// ─────────────────────────── ไดอะล็อกตรวจสลิป ───────────────────────────

const rejectReasons = ["ยอดเงินไม่ตรงกับบิล", "โอนเข้าบัญชีอื่น", "สลิปซ้ำกับรายการเดิม", "สลิปไม่ชัด / ตรวจสอบไม่ได้"];

/** ตรวจสลิป 1 รายการ : ภาพสลิป + ผลตรวจรายข้อ + ยอดเงิน + รายการเดินบัญชีที่จับคู่ → อนุมัติ / ปฏิเสธ */
export function SlipReviewModal({ approvalId, queue }: { approvalId: string; queue?: string[] }) {
  const { t, d, lang, toast, closeModal, openModal, staff, go } = useAdmin();
  const idx = useDemoIndex();
  const [currentId, setCurrentId] = useState(approvalId);
  const approvals = useDemoStore((s) => s.approvals);
  const bankTxns = useDemoStore((s) => s.bankTxns);
  const uploads = useDemoStore((s) => s.uploads);
  const today = useDemoStore((s) => s.today);
  const approvePayments = useDemoStore((s) => s.approvePayments);
  const rejectPayment = useDemoStore((s) => s.rejectPayment);
  const staffName = useStaffName();
  const now = useNow(1000);
  const [dateMode, setDateMode] = useState<"slip" | "custom">("slip");
  const [customDate, setCustomDate] = useState(today);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const found = approvals.find((a) => a.id === currentId);
  if (!found) return <div className="p-8 text-center text-[13px] text-slate-500">{t("ไม่พบข้อมูล")}</div>;
  const approval = found;
  const intent = idx.intentById.get(approval.intentId);
  const customer = idx.customerById.get(approval.customerId)!;
  const account = idx.accountById.get(approval.accountId)!;
  const invoices = (intent?.invoiceIds ?? []).map((id) => idx.invoiceById.get(id)!).filter(Boolean);
  const txn = bankTxns.find((tx) => tx.id === approval.bankTxnId);
  const upload = txn && uploads.find((u) => u.id === txn.uploadId);
  const receipt = approval.receiptId ? idx.receiptById.get(approval.receiptId) : undefined;
  const processing = isProcessing(approval);
  const pending = approval.status === "pending";
  const diff = amountDiff(approval);

  // รายการถัดไปที่ยังรออนุมัติ (ตามลำดับในตาราง)
  const order = queue ?? approvals.map((a) => a.id);
  const waiting = order.filter((id) => id !== currentId && approvals.some((a) => a.id === id && a.status === "pending" && !a.estimatedAt));
  const nextId = waiting.find((id) => order.indexOf(id) > order.indexOf(currentId)) ?? waiting[0];

  function switchTo(id: string) {
    setCurrentId(id);
    setRejecting(false);
    setReason("");
    setDateMode("slip");
  }

  function approve() {
    setBusy(true);
    window.setTimeout(() => {
      const [r] = approvePayments([approval.id], { staff: staff.th, paidAt: dateMode === "custom" ? `${customDate}T${time(approval.slip.at)}:00` : undefined });
      setBusy(false);
      if (r) toast(t("อนุมัติ {no} แล้ว · ออกใบเสร็จ {re}", { no: approval.no, re: r.no }), "success");
    }, 500);
  }

  function reject() {
    rejectPayment(approval.id, { staff: staff.th, note: reason.trim() || t("ไม่ระบุเหตุผล") });
    setRejecting(false);
    toast(t("ปฏิเสธ {no} แล้ว — บิลกลับไปค้างชำระ", { no: approval.no }), "warning");
  }

  const checkRows: { key: keyof Approval["checks"]; label: string; detail: ReactNode }[] = [
    {
      key: "account",
      label: t("บัญชีผู้รับ"),
      detail: (
        <>
          {d(approval.slip.receiverName)} · <span className="font-mono">{approval.slip.receiverAccount}</span>
          {approval.checks.account === "mismatch" && (
            <span className="block text-slate-500">
              {t("บัญชีของสาขา")}: {d(account.accountName)} · <span className="font-mono">{maskAccount(account)}</span>
            </span>
          )}
        </>
      ),
    },
    { key: "amount", label: t("ยอดเงิน"), detail: <>{t("สลิป ฿{a} · ตามบิล ฿{b}", { a: money(approval.slip.amount), b: money(approval.amount) })}</> },
    {
      key: "date",
      label: t("วันที่โอน"),
      detail: approval.checks.date === "unknown" ? t("อ่านวันที่จากสลิปไม่ได้ — รอยืนยันจากรายการเดินบัญชี") : <>{t("โอน {a} · สร้างรายการ {b}", { a: `${shortDate(approval.slip.at, lang)} ${time(approval.slip.at)}`, b: intent ? `${shortDate(intent.createdAt, lang)} ${time(intent.createdAt)}` : "-" })}</>,
    },
  ];

  let banner: ReactNode = null;
  if (approval.status === "completed")
    banner = (
      <Banner tone="green" icon={CheckCircle2}>
        {t("อนุมัติแล้วโดย {who} · {at}", { who: staffName(approval.reviewedBy), at: approval.reviewedAt ? `${shortDate(approval.reviewedAt, lang)} ${time(approval.reviewedAt)}` : "-" })}
        {receipt && <span className="block font-normal">{t("ออกใบเสร็จ {no}", { no: receipt.no })}</span>}
      </Banner>
    );
  else if (approval.status === "rejected")
    banner = (
      <Banner tone="red" icon={Ban}>
        {t("ปฏิเสธโดย {who} · {at}", { who: staffName(approval.reviewedBy), at: approval.reviewedAt ? `${shortDate(approval.reviewedAt, lang)} ${time(approval.reviewedAt)}` : "-" })}
        <span className="block font-normal">{approval.note ? t(approval.note) : ""}</span>
      </Banner>
    );
  else if (processing)
    banner = (
      <Banner tone="blue" icon={Loader2} spin>
        {t("ระบบกำลังอ่านสลิปและจับคู่รายการ")}
        <span className="block font-normal">
          <ReviewCountdownPill approval={approval} now={now} />
        </span>
      </Banner>
    );
  else if (approval.duplicateOf) banner = <Banner tone="red" icon={Copy}>{t("สลิปนี้เคยใช้กับรายการ {no} แล้ว — ตรวจสอบก่อนอนุมัติ", { no: approval.duplicateOf })}</Banner>;
  else if (approval.checks.account === "mismatch") banner = <Banner tone="red" icon={TriangleAlert}>{t("บัญชีผู้รับในสลิปไม่ตรงกับบัญชีของสาขา")}</Banner>;
  else if (diff < 0) banner = <Banner tone="red" icon={TriangleAlert}>{t("ยอดที่รับจริงน้อยกว่ายอดตามบิล ฿{v}", { v: money(-diff) })}</Banner>;
  else if (!txn)
    banner = (
      <Banner tone="amber" icon={Landmark}>
        {t("ยังไม่พบรายการนี้ใน Bank Statement")}
        <span className="block font-normal">{t("อัปโหลด Statement ล่าสุดเพื่อยืนยันว่าเงินเข้าบัญชีจริง")}</span>
      </Banner>
    );

  return (
    <div className="flex h-full max-h-full flex-col">
      {/* หัว */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
          <BadgeCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold text-slate-900">
            {t("ตรวจสอบสลิป")} · {approval.no}
          </div>
          <div className="truncate text-[12px] text-slate-500">
            {d(customer.shop)} · {customer.custNo} · {t("ล็อก")} {invoices[0] ? idx.areaNames(invoices[0].areaIds) : "-"}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <ConfidenceChip approval={approval} />
          <ApprovalStatusChip approval={approval} />
          <ChannelBadge channel={approval.channel} />
        </div>
        <button type="button" onClick={closeModal} aria-label={t("ปิด")} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
          <X className="size-4" />
        </button>
      </div>

      {/* เนื้อหา : ซ้ายสลิป ขวารายละเอียด */}
      <div className="flex min-h-0 flex-1 gap-5 px-5 py-4">
        <div className="shrink-0">
          <SlipViewer key={approval.id} slip={approval.slip} />
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-slate-500" style={{ width: VIEW_W }}>
            <span>
              {t("เลขที่แนบสลิป")} <b className="text-slate-700">{approval.slip.no}</b>
            </span>
            <span>
              {t("แนบเมื่อ")} {shortDate(approval.createdAt, lang)} {time(approval.createdAt)}
            </span>
          </div>
        </div>

        <div className="thin-scroll min-w-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {banner}

          <section>
            <SectionTitle>{t("ผลตรวจรายข้อ")}</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {checkRows.map((row) => (
                <div key={row.key} className="flex items-start gap-3 px-3 py-2.5 text-[12.5px]">
                  <CheckIcon result={processing ? "unknown" : approval.checks[row.key]} />
                  <div className="w-[88px] shrink-0 font-semibold text-slate-700">{row.label}</div>
                  <div className="min-w-0 flex-1 text-slate-600">{processing ? t("กำลังตรวจ...") : row.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>{t("ยอดเงิน")}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              <AmountBox label={t("ยอดที่ต้องชำระตามบิล")} value={`฿${money(approval.amount)}`} />
              <AmountBox label={t("ยอดที่รับจริง (จากสลิป)")} value={`฿${money(approval.slip.amount)}`} />
              <AmountBox
                label={t("ส่วนต่าง")}
                value={diff === 0 ? t("ตรงกัน") : `${diff < 0 ? "-" : "+"}฿${money(Math.abs(diff))}`}
                tone={diff === 0 ? "green" : "red"}
                foot={diff < 0 ? t("จ่ายขาด") : diff > 0 ? t("จ่ายเกิน") : undefined}
              />
            </div>
          </section>

          <section>
            <SectionTitle>{t("รายการเดินบัญชีที่จับคู่")}</SectionTitle>
            {txn ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 text-[12.5px]">
                <div className="flex items-center gap-2">
                  <BankLogo bank={account.bank} size={22} />
                  <b className="text-slate-800">
                    {shortDate(txn.at, lang)} {time(txn.at)}
                  </b>
                  <Badge tone="green" className="ml-1">
                    {t("จับคู่ดีที่สุด")}
                  </Badge>
                  <b className="ml-auto tabular-nums text-emerald-700">+฿{money(txn.amount)}</b>
                </div>
                <div className="mt-1 text-slate-600">{d(txn.detail)}</div>
                {upload && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <FileSpreadsheet className="size-3.5" /> {upload.fileName} · {t("อัปโหลดเมื่อ")} {shortDate(upload.at, lang)} {time(upload.at)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-[12.5px] text-slate-500">
                {approval.duplicateOf || approval.checks.account === "mismatch" ? t("ไม่พบเงินเข้าที่ตรงกับสลิปนี้") : t("ยังไม่มีในไฟล์ Statement ที่อัปโหลด")}
                {pending && !approval.duplicateOf && approval.checks.account !== "mismatch" && (
                  <Btn size="sm" variant="outline" icon={Upload} onClick={() => openModal(<UploadStatementModal accountId={approval.accountId} reopen={approval.id} />)}>
                    {t("อัปโหลด Statement")}
                  </Btn>
                )}
              </div>
            )}
          </section>

          <section>
            <SectionTitle>{t("ใบวางบิลในรายการนี้")}</SectionTitle>
            <div className="space-y-1.5">
              {invoices.map((iv) => (
                <div key={iv.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px]">
                  <ReceiptText className="size-4 text-slate-400" />
                  <b className="text-slate-800">{iv.no}</b>
                  <span className="text-slate-500">
                    {t("ครบกำหนด")} {shortDate(iv.dueDate, lang)}
                  </span>
                  <b className="ml-auto tabular-nums">฿{money(invoiceAmount(iv))}</b>
                </div>
              ))}
              {intent && intent.fine > 0 && (
                <div className="flex justify-between px-3 text-[12px] text-red-700">
                  <span>{t("ค่าปรับชำระล่าช้า")}</span>
                  <span className="tabular-nums">+฿{money(intent.fine)}</span>
                </div>
              )}
            </div>
          </section>

          {pending && !processing && (
            <section>
              <SectionTitle>{t("วันที่รับชำระบนใบเสร็จ")}</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-[12px] font-semibold">
                  {(["slip", "custom"] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => setDateMode(mode)} className={cn("rounded-md px-3 py-1.5 transition", dateMode === mode ? "bg-white text-leaf-800 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
                      {mode === "slip" ? t("อิงวันที่ตามสลิป") : t("เลือกวันที่เอง")}
                    </button>
                  ))}
                </div>
                {dateMode === "slip" ? (
                  <span className="text-[12.5px] text-slate-600">
                    {shortDate(approval.slip.at, lang)} {time(approval.slip.at)}
                  </span>
                ) : (
                  <input type="date" value={customDate} max={today} onChange={(e) => setCustomDate(e.target.value || today)} className="h-8 rounded-lg border border-slate-300 px-2 text-[12.5px]" />
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ท้าย */}
      <div className="border-t border-slate-200 px-5 py-3">
        {rejecting ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {rejectReasons.map((r) => (
                <button key={r} type="button" onClick={() => setReason(t(r))} className={cn("rounded-full border px-2.5 py-1 text-[11.5px] font-semibold", reason === t(r) ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                  {t(r)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("เหตุผลที่ปฏิเสธ (แจ้งผู้เช่า)")} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-red-400" />
              <Btn variant="outline" onClick={() => setRejecting(false)}>
                {t("ยกเลิก")}
              </Btn>
              <Btn variant="danger" icon={Ban} disabled={!reason.trim()} onClick={reject}>
                {t("ยืนยันปฏิเสธ")}
              </Btn>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {nextId && (
              <Btn variant="ghost" icon={ChevronRight} onClick={() => switchTo(nextId)}>
                {t("รายการถัดไป")}
              </Btn>
            )}
            <div className="ml-auto flex gap-2">
              {pending ? (
                <>
                  <Btn variant="danger" icon={Ban} disabled={processing || busy} onClick={() => setRejecting(true)}>
                    {t("ปฏิเสธ")}
                  </Btn>
                  <Btn icon={busy ? undefined : Check} disabled={processing || busy} onClick={approve}>
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {t("อนุมัติ")} · ฿{money(approval.amount)}
                  </Btn>
                </>
              ) : (
                <>
                  {receipt && (
                    <Btn variant="outline" icon={ReceiptText} onClick={() => openModal(<DocumentModal kind="receipt" id={receipt.id} />, { wide: true })}>
                      {t("ดูใบเสร็จ")}
                    </Btn>
                  )}
                  <Btn variant="outline" onClick={() => (approval.status === "rejected" ? go("account", { tab: "invoice" }) : closeModal())}>
                    {approval.status === "rejected" ? t("ไปที่ใบวางบิล") : t("ปิด")}
                  </Btn>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-slate-400">{children}</div>;
}

function CheckIcon({ result }: { result: CheckResult }) {
  if (result === "match") return <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-3.5" strokeWidth={3} /></span>;
  if (result === "mismatch") return <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-700"><X className="size-3.5" strokeWidth={3} /></span>;
  return <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"><CircleHelp className="size-3.5" /></span>;
}

function AmountBox({ label, value, tone, foot }: { label: string; value: string; tone?: "green" | "red"; foot?: string }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2", tone === "red" ? "border-red-200 bg-red-50" : tone === "green" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white")}>
      <div className="truncate text-[11px] font-semibold text-slate-500">{label}</div>
      <div className={cn("text-[16px] font-bold tabular-nums", tone === "red" ? "text-red-700" : tone === "green" ? "text-emerald-700" : "text-slate-900")}>{value}</div>
      {foot && <div className="text-[10.5px] font-semibold text-red-600">{foot}</div>}
    </div>
  );
}

function Banner({ tone, icon: Icon, spin, children }: { tone: "green" | "red" | "amber" | "blue"; icon: LucideIcon; spin?: boolean; children: ReactNode }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
  };
  return (
    <div className={cn("flex gap-2.5 rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed", tones[tone])}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", spin && "animate-spin")} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// ─────────────────────────── อัปโหลด Bank Statement ───────────────────────────

type Phase = "form" | "uploading" | "done" | "failed";
const stages = ["อัปโหลดไฟล์", "อ่านรายการเดินบัญชี", "จับคู่กับสลิปที่รอ"];

/**
 * อัปโหลด Statement 3 ขั้น : บัญชีรับเงิน → รูปแบบไฟล์ของธนาคาร → เลือกไฟล์
 * สำเร็จแล้วปิดเองใน 5 วินาที (เหมือนระบบจริง) — ถ้าเปิดมาจากไดอะล็อกตรวจสลิปจะกลับไปที่รายการเดิม
 */
export function UploadStatementModal({ accountId: initialAccount, reopen }: { accountId?: string; reopen?: string }) {
  const { t, d, closeModal, openModal, toast, staff } = useAdmin();
  const accounts = useDemoStore((s) => s.accounts).filter((a) => a.kind !== "cash");
  const approvals = useDemoStore((s) => s.approvals);
  const customers = useDemoStore((s) => s.customers);
  const importStatement = useDemoStore((s) => s.importStatement);
  const [accountId, setAccountId] = useState(initialAccount ?? accounts[0]?.id ?? "");
  const account = accounts.find((a) => a.id === accountId);
  const patterns = statementPatterns.filter((p) => p.bank === account?.bank);
  const [patternId, setPatternId] = useState(patterns[0]?.id ?? "");
  const pattern = patterns.find((p) => p.id === patternId) ?? patterns[0];
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [hint, setHint] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ rows: number; matched: string[] } | null>(null);
  const [closeIn, setCloseIn] = useState(5);
  const input = useRef<HTMLInputElement>(null);
  const waiting = approvals.filter((a) => a.status === "pending" && a.accountId === accountId && !a.bankTxnId && !a.duplicateOf && a.checks.account !== "mismatch").length;

  function finish() {
    if (reopen) openModal(<SlipReviewModal approvalId={reopen} />, { xl: true });
    else closeModal();
  }

  // ปิดเองหลังสำเร็จ 5 วินาที
  useEffect(() => {
    if (phase !== "done") return;
    const tick = window.setInterval(() => setCloseIn((n) => Math.max(0, n - 1)), 1000);
    const close = window.setTimeout(finish, 5000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(close);
    };
    // finish อ้างแค่ค่าคงที่ของ props/context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function pickAccount(id: string) {
    setAccountId(id);
    const bank = accounts.find((a) => a.id === id)?.bank;
    setPatternId(statementPatterns.find((p) => p.bank === bank)?.id ?? "");
    setHint("");
  }

  function choose(f: File | undefined) {
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    setFile({ name: f.name, size: f.size });
    if (!STATEMENT_ACCEPT.split(",").includes(ext)) {
      setHint(t("รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv"));
      return;
    }
    // เลือกรูปแบบไฟล์ให้ตรงกับนามสกุลอัตโนมัติ (ถ้าธนาคารนี้มีรูปแบบนั้น)
    if (pattern && pattern.ext !== ext) {
      const match = patterns.find((p) => p.ext === ext);
      if (match) {
        setPatternId(match.id);
        setHint(t("เปลี่ยนรูปแบบไฟล์เป็น {v} ให้ตรงกับไฟล์แล้ว", { v: match.name }));
        return;
      }
      setHint(t("ไฟล์ {ext} ไม่ตรงกับรูปแบบ {v}", { ext, v: `${pattern.name} (${pattern.ext})` }));
      return;
    }
    setHint("");
  }

  const fileOk = Boolean(file && pattern && file.name.toLowerCase().endsWith(pattern.ext));

  function upload() {
    if (!file || !account || !pattern) return;
    setPhase("uploading");
    setProgress(0);
    let p = 0;
    const timer = window.setInterval(() => {
      p += 7 + Math.random() * 9;
      if (p < 100) return setProgress(p);
      window.clearInterval(timer);
      setProgress(100);
      const r = importStatement({ accountId: account.id, pattern: pattern.id, fileName: file.name, fileSize: file.size, staff: staff.th });
      setResult({ rows: r.upload.rows, matched: r.matched });
      setPhase("done");
      setCloseIn(5);
      toast(t("นำเข้า {n} รายการ · จับคู่ได้ {m} รายการ", { n: r.upload.rows, m: r.matched.length }), r.matched.length ? "success" : "info");
    }, 160);
  }

  const stage = progress < 34 ? 0 : progress < 72 ? 1 : 2;

  return (
    <div className="flex max-h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
        <span className="grid size-9 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
          <Upload className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold text-slate-900">{t("อัปโหลด Statement")}</div>
          <div className="truncate text-[12px] text-slate-500">{t("ไฟล์รายการเดินบัญชีจากธนาคาร — ระบบจะจับคู่กับสลิปที่รอให้อัตโนมัติ")}</div>
        </div>
        <button type="button" onClick={finish} aria-label={t("ปิด")} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
          <X className="size-4" />
        </button>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {phase === "form" || phase === "failed" ? (
          <div className="space-y-4">
            <Step n={1} title={t("บัญชีรับเงิน")}>
              <div className="grid grid-cols-3 gap-2">
                {accounts.map((a) => (
                  <button key={a.id} type="button" onClick={() => pickAccount(a.id)} className={cn("flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left", a.id === accountId ? "border-leaf-500 bg-leaf-50 ring-1 ring-leaf-500" : "border-slate-200 hover:bg-slate-50")}>
                    <BankLogo bank={a.bank} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-slate-800">{d(a.name)}</span>
                      <span className="block truncate font-mono text-[10.5px] text-slate-500">{a.accountNo}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-1.5 text-[11.5px] text-slate-500">{t("สลิปที่รอจับคู่กับบัญชีนี้ {n} รายการ", { n: waiting })}</div>
            </Step>

            <Step n={2} title={t("รูปแบบไฟล์ (Template)")}>
              <div className="space-y-1.5">
                {patterns.map((p) => (
                  <label key={p.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-[12.5px]", p.id === pattern?.id ? "border-leaf-500 bg-leaf-50" : "border-slate-200 hover:bg-slate-50")}>
                    <input type="radio" name="pattern" checked={p.id === pattern?.id} onChange={() => setPatternId(p.id)} className="accent-[#6E9B3E]" />
                    <FileSpreadsheet className="size-4 text-leaf-700" />
                    <b className="text-slate-800">{p.name}</b>
                    <span className="text-slate-500">({p.ext})</span>
                    <span className="ml-auto font-mono text-[10.5px] text-slate-400">{p.code}</span>
                    {p.id === patterns[0]?.id && <Badge tone="leaf">{t("ค่าเริ่มต้น")}</Badge>}
                  </label>
                ))}
              </div>
            </Step>

            <Step n={3} title={t("เลือกไฟล์")}>
              <button
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  choose(e.dataTransfer.files[0]);
                }}
                className={cn("flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition", file ? "border-leaf-400 bg-leaf-50/60" : "border-slate-300 bg-slate-50 hover:border-leaf-400")}
              >
                <FileSpreadsheet className="size-7 text-leaf-700" />
                {file ? (
                  <>
                    <b className="max-w-full truncate text-[13px] text-slate-800">{file.name}</b>
                    <span className="text-[11.5px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · {t("คลิกเพื่อเปลี่ยนไฟล์")}
                    </span>
                  </>
                ) : (
                  <>
                    <b className="text-[13px] text-slate-700">{t("ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์")}</b>
                    <span className="text-[11.5px] text-slate-500">.xlsx · .xls · .csv</span>
                  </>
                )}
              </button>
              <input ref={input} type="file" accept={STATEMENT_ACCEPT} className="hidden" onChange={(e) => choose(e.target.files?.[0] ?? undefined)} />
              {hint && <div className={cn("mt-1.5 text-[11.5px] font-semibold", fileOk ? "text-leaf-700" : "text-red-600")}>{hint}</div>}
            </Step>
          </div>
        ) : phase === "uploading" ? (
          <div className="py-6">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
              <Loader2 className="size-4 animate-spin text-leaf-700" /> {t(stages[stage])}...
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-leaf-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
            </div>
            <ol className="mt-4 space-y-1.5 text-[12.5px]">
              {stages.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2", i < stage ? "text-emerald-700" : i === stage ? "font-semibold text-slate-800" : "text-slate-400")}>
                  {i < stage ? <CheckCircle2 className="size-4" /> : i === stage ? <Loader2 className="size-4 animate-spin" /> : <span className="size-4 rounded-full border border-slate-300" />}
                  {t(s)}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          result && (
            <div className="py-2">
              <div className="flex flex-col items-center text-center">
                <span className="grid size-14 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </span>
                <div className="mt-2 text-[16px] font-bold text-slate-900">{t("อัปโหลดสำเร็จ")}</div>
                <div className="text-[12.5px] text-slate-500">
                  {t("นำเข้า {n} รายการ · จับคู่ได้ {m} รายการ", { n: result.rows, m: result.matched.length })}
                </div>
              </div>
              {result.matched.length > 0 ? (
                <div className="mt-4 space-y-1.5">
                  {result.matched.map((id) => {
                    const a = approvals.find((x) => x.id === id);
                    const c = a && customers.find((x) => x.id === a.customerId);
                    if (!a || !c) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[12.5px]">
                        <BadgeCheck className="size-4 text-emerald-600" />
                        <b className="text-slate-800">{a.no}</b>
                        <span className="truncate text-slate-600">{d(c.shop)}</span>
                        <b className="ml-auto tabular-nums">฿{money(a.slip.amount)}</b>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-[12.5px] text-slate-500">{t("ไม่มีสลิปที่รอจับคู่กับบัญชีนี้ — รายการเดินบัญชีถูกเก็บไว้ตรวจย้อนหลัง")}</p>
              )}
              <p className="mt-3 text-center text-[11.5px] text-slate-400">{t("ปิดอัตโนมัติใน {n} วินาที", { n: closeIn })}</p>
            </div>
          )
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        {phase === "done" ? (
          <Btn onClick={finish}>{t("ปิด")}</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={finish} disabled={phase === "uploading"}>
              {t("ยกเลิก")}
            </Btn>
            <Btn icon={Upload} disabled={!fileOk || phase === "uploading"} onClick={upload}>
              {t("อัปโหลด")}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-2 text-[12.5px] font-bold text-slate-700">
        <span className="grid size-5 place-items-center rounded-full bg-leaf-600 text-[11px] text-white">{n}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

/** ประวัติอัปโหลด Statement */
export function UploadHistoryModal() {
  const { t, d, lang } = useAdmin();
  const uploads = useDemoStore((s) => s.uploads);
  const accounts = useDemoStore((s) => s.accounts);
  const staffName = useStaffName();
  return (
    <div className="flex max-h-full flex-col">
      <HistoryHeader />
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-[#F4F4EC] text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">{t("เวลา")}</th>
              <th className="px-3 py-2">{t("บัญชีรับเงิน")}</th>
              <th className="px-3 py-2">{t("ไฟล์")}</th>
              <th className="px-3 py-2 text-right">{t("จำนวนรายการ")}</th>
              <th className="px-3 py-2 text-right">{t("จับคู่ได้")}</th>
              <th className="px-3 py-2">{t("ผู้อัปโหลด")}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {uploads.map((u) => {
              const a = accounts.find((x) => x.id === u.accountId);
              const p = statementPatterns.find((x) => x.id === u.pattern);
              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {shortDate(u.at, lang)} {time(u.at)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      {a && <BankLogo bank={a.bank} size={20} />}
                      {a ? d(a.name) : "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-800">{u.fileName}</div>
                    <div className="font-mono text-[10.5px] text-slate-400">{p?.code}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right">{u.rows}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">{u.matched}</td>
                  <td className="px-3 py-2.5 text-slate-500">{staffName(u.by)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryHeader() {
  const { t, closeModal } = useAdmin();
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
      <span className="grid size-9 place-items-center rounded-xl bg-leaf-100 text-leaf-700">
        <History className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-bold text-slate-900">{t("ประวัติอัปโหลด")}</div>
        <div className="truncate text-[12px] text-slate-500">{t("ไฟล์ Bank Statement ที่นำเข้าระบบ")}</div>
      </div>
      <button type="button" onClick={closeModal} aria-label={t("ปิด")} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
