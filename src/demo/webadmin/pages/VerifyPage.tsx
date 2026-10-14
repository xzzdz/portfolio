"use client";

// หน้า "ตรวจสอบการชำระเงิน" : ตรวจสลิป จับคู่รายการ และอนุมัติการชำระเงินของผู้เช่าพื้นที่
// ทุกแท็บใช้ข้อมูลชุดเดียวกัน ต่างกันแค่ตัวกรองสถานะ (ระบบจริงยิงเส้นเดียว ต่างกันแค่ &status=)

import { ArrowDownUp, BadgeCheck, Check, Eye, History, Upload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { addDays, money, shortDate, time } from "@/lib/format";
import type { Approval } from "../../data/types";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { amountDiff, isProcessing } from "../../verify";
import { useAdmin } from "../AdminContext";
import { Btn, ChannelBadge, DataTable, PageHeader, Panel, SearchInput, Select, Tabs, type Column } from "../ui/kit";
import { ApprovalStatusChip, ConfidenceCell, PendingDuration, ReviewCountdownPill, SlipReviewModal, UploadHistoryModal, UploadStatementModal, useNow, useStaffName } from "./VerifyParts";

type Tab = "all" | "pending" | "completed" | "rejected";
type Range = "all" | "today" | "7d";

export function VerifyPage() {
  const { t, d, lang, openModal, toast, staff } = useAdmin();
  const idx = useDemoIndex();
  const approvals = useDemoStore((s) => s.approvals);
  const uploads = useDemoStore((s) => s.uploads);
  const today = useDemoStore((s) => s.today);
  const approvePayments = useDemoStore((s) => s.approvePayments);
  const staffName = useStaffName();
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const now = useNow(approvals.some(isProcessing) ? 1000 : 30_000);

  const q = query.trim().toLowerCase();
  const areaOf = (a: Approval) => {
    const intent = idx.intentById.get(a.intentId);
    const iv = intent && idx.invoiceById.get(intent.invoiceIds[0]);
    return iv ? idx.areaNames(iv.areaIds) : "";
  };
  const inRange = (a: Approval) => (range === "all" ? true : range === "today" ? a.createdAt.startsWith(today) : a.createdAt.slice(0, 10) >= addDays(today, -6));
  const matches = (a: Approval) => {
    if (!q) return true;
    const c = idx.customerById.get(a.customerId);
    return [a.no, a.slip.no, a.slip.ref, c?.shop.th, c?.shop.en, c?.name.th, c?.name.en, c?.custNo, areaOf(a)].some((v) => v?.toLowerCase().includes(q));
  };
  const base = approvals.filter((a) => inRange(a) && matches(a));
  const byTab = (a: Approval) => tab === "all" || a.status === tab;
  const rows = base.filter(byTab).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1) * (newestFirst ? 1 : -1));
  const selectable = (a: Approval) => a.status === "pending" && !isProcessing(a);
  const pickable = rows.filter(selectable);
  const selected = picked.filter((id) => pickable.some((a) => a.id === id));
  const verified = pickable.filter((a) => a.confidenceStatus === "verified_match");
  const selectedTotal = selected.reduce((sum, id) => sum + (approvals.find((a) => a.id === id)?.amount ?? 0), 0);
  const allPicked = pickable.length > 0 && pickable.every((a) => selected.includes(a.id));

  const pendingAll = approvals.filter((a) => a.status === "pending");
  const lastUpload = uploads[0];

  function toggle(id: string) {
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  function approveSelected() {
    setBusy(true);
    window.setTimeout(() => {
      const receipts = approvePayments(selected, { staff: staff.th });
      setBusy(false);
      setPicked([]);
      toast(t("อนุมัติแล้ว {n} รายการ · ออกใบเสร็จ {v}", { n: receipts.length, v: receipts.map((r) => r.no).join(", ") }), "success");
    }, 600);
  }

  const open = (a: Approval) => openModal(<SlipReviewModal approvalId={a.id} queue={rows.map((r) => r.id)} />, { xl: true });

  const columns: Column<Approval>[] = [
    {
      key: "pick",
      header: (
        <input
          type="checkbox"
          aria-label={t("เลือกทั้งหมด")}
          checked={allPicked}
          disabled={!pickable.length}
          onChange={() => setPicked(allPicked ? [] : pickable.map((a) => a.id))}
          className="size-4 accent-[#6E9B3E]"
        />
      ),
      className: "w-10",
      render: (a) =>
        selectable(a) ? (
          <span onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" aria-label={a.no} checked={selected.includes(a.id)} onChange={() => toggle(a.id)} className="size-4 accent-[#6E9B3E]" />
          </span>
        ) : null,
    },
    {
      key: "no",
      header: t("รายการ"),
      sort: (a) => a.createdAt,
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-800">{a.no}</div>
          <div className="text-[11px] text-slate-500">
            {shortDate(a.createdAt, lang)} {time(a.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "shop",
      header: t("ผู้เช่า"),
      sort: (a) => d(idx.customerById.get(a.customerId)!.shop),
      render: (a) => {
        const c = idx.customerById.get(a.customerId)!;
        return (
          <div className="min-w-0">
            <div className="max-w-[190px] truncate font-medium text-slate-800">{d(c.shop)}</div>
            <div className="text-[11px] text-slate-500">
              {t("ล็อก")} {areaOf(a)} · {c.custNo}
            </div>
          </div>
        );
      },
    },
    {
      key: "channel",
      header: t("ช่องทาง"),
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <BankLogo bank={idx.accountById.get(a.accountId)!.bank} size={22} />
          <ChannelBadge channel={a.channel} />
        </div>
      ),
    },
    {
      key: "amount",
      header: t("ยอดเงิน"),
      align: "right",
      sort: (a) => a.amount,
      render: (a) => {
        const diff = amountDiff(a);
        return (
          <div>
            <b className="text-slate-900">฿{money(a.amount)}</b>
            {diff !== 0 && (
              <div className="text-[11px] font-semibold text-red-600">
                {t("สลิป ฿{v}", { v: money(a.slip.amount) })} ({diff < 0 ? t("ขาด") : t("เกิน")} ฿{money(Math.abs(diff))})
              </div>
            )}
          </div>
        );
      },
    },
    { key: "confidence", header: t("ความมั่นใจ"), sort: (a) => a.confidence ?? -1, render: (a) => <ConfidenceCell approval={a} /> },
    {
      key: "status",
      header: t("สถานะ"),
      sort: (a) => a.status,
      render: (a) => (
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1">
            <ApprovalStatusChip approval={a} />
            <ReviewCountdownPill approval={a} now={now} />
          </div>
          {a.status === "pending" ? <PendingDuration approval={a} now={now} /> : <div className="text-[11px] text-slate-500">{staffName(a.reviewedBy)}</div>}
        </div>
      ),
    },
    {
      key: "act",
      header: "",
      align: "right",
      render: (a) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Btn size="sm" variant={a.status === "pending" ? "outline" : "ghost"} icon={Eye} onClick={() => open(a)}>
            {a.status === "pending" ? t("ตรวจสอบ") : t("ดู")}
          </Btn>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("ตรวจสอบการชำระเงิน")}
        subtitle={t("ตรวจสอบสลิป จับคู่รายการ และอนุมัติการชำระเงินของผู้เช่าพื้นที่")}
        icon={BadgeCheck}
        actions={
          <>
            <Btn variant="outline" icon={History} onClick={() => openModal(<UploadHistoryModal />, { wide: true })}>
              {t("ประวัติอัปโหลด")}
            </Btn>
            <Btn icon={Upload} onClick={() => openModal(<UploadStatementModal />)}>
              {t("อัปโหลด Statement")}
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t("รออนุมัติ"), value: String(pendingAll.length), foot: `฿${money(pendingAll.reduce((s, a) => s + a.amount, 0))}`, tone: "text-slate-900" },
          { label: t("ตรงกันยืนยันแล้ว"), value: String(pendingAll.filter((a) => a.confidenceStatus === "verified_match").length), foot: t("พร้อมอนุมัติ"), tone: "text-emerald-700" },
          { label: t("ต้องตรวจสอบ / แนะนำให้ตรวจ"), value: String(pendingAll.filter((a) => a.confidenceStatus === "needs_inspection" || a.confidenceStatus === "review_recommended").length), foot: t("เปิดดูสลิปก่อนตัดสินใจ"), tone: "text-amber-700" },
          { label: t("Statement ล่าสุด"), value: lastUpload ? `${time(lastUpload.at)}` : "-", foot: lastUpload ? `${shortDate(lastUpload.at, lang)} · ${lastUpload.fileName}` : t("ยังไม่มีไฟล์"), tone: "text-slate-900" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="text-[12px] font-semibold text-slate-500">{k.label}</div>
            <div className={cn("mt-1 text-[24px] font-bold tabular-nums tracking-tight", k.tone)}>{k.value}</div>
            <div className="truncate text-[11.5px] text-slate-500">{k.foot}</div>
          </div>
        ))}
      </div>

      <Panel bodyClass="space-y-3">
        {/* ตัวกรองแถวเดียว */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหาชื่อลูกค้า, รหัสพื้นที่, เลขที่รายการ...")} className="w-80" />
          <Select
            value={range}
            onChange={setRange}
            label={t("ช่วงวันที่")}
            options={[
              { value: "all", label: t("ทั้งหมด") },
              { value: "today", label: t("วันนี้") },
              { value: "7d", label: t("7 วันล่าสุด") },
            ]}
          />
          <Btn variant="outline" icon={ArrowDownUp} onClick={() => setNewestFirst((v) => !v)}>
            {newestFirst ? t("ล่าสุดก่อน") : t("เก่าสุดก่อน")}
          </Btn>
          {verified.length > 0 && tab !== "completed" && tab !== "rejected" && (
            <Btn variant="ghost" icon={BadgeCheck} className="ml-auto text-emerald-700" onClick={() => setPicked(verified.map((a) => a.id))}>
              {t("เลือกรายการที่ตรงกัน ({n})", { n: verified.length })}
            </Btn>
          )}
        </div>

        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPicked([]);
          }}
          items={[
            { value: "all", label: t("ทั้งหมด"), count: base.length },
            { value: "pending", label: t("รออนุมัติ"), count: base.filter((a) => a.status === "pending").length },
            { value: "completed", label: t("อนุมัติสำเร็จ"), count: base.filter((a) => a.status === "completed").length },
            { value: "rejected", label: t("ปฏิเสธสำเร็จ"), count: base.filter((a) => a.status === "rejected").length },
          ]}
        />

        {selected.length > 0 && (
          <div className="flex animate-fade-in items-center gap-3 rounded-xl bg-leaf-50 px-3 py-2 text-[12.5px] ring-1 ring-leaf-200">
            <b className="text-leaf-900">{t("เลือก {n} รายการ", { n: selected.length })}</b>
            <span className="tabular-nums text-leaf-800">฿{money(selectedTotal)}</span>
            <button type="button" onClick={() => setPicked([])} className="text-[12px] font-semibold text-slate-500 hover:text-slate-800">
              {t("ล้าง")}
            </button>
            <Btn size="sm" icon={Check} className="ml-auto" disabled={busy} onClick={approveSelected}>
              {t("อนุมัติที่เลือก")}
            </Btn>
          </div>
        )}

        <DataTable
          key={`${tab}-${range}-${q}-${newestFirst}`}
          rows={rows}
          columns={columns}
          rowKey={(a) => a.id}
          onRowClick={open}
          pageSize={8}
          rowClass={(a) => (selected.includes(a.id) ? "bg-leaf-50/70" : isProcessing(a) ? "bg-blue-50/40" : undefined)}
          empty={q ? t("ไม่พบรายการที่ตรงกับ \"{q}\"", { q: query.trim() }) : t("ไม่พบรายการในแท็บนี้")}
        />
      </Panel>
    </div>
  );
}
