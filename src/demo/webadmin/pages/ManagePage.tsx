"use client";

import { Check, CheckCircle2, Droplets, FileText, Image as ImageIcon, PlayCircle, RotateCcw, TriangleAlert, Wrench, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { int, money, monthYear, shortDate, time } from "@/lib/format";
import { firstOfMonth } from "../../data/seed";
import type { MaintenanceTicket, MeterReading } from "../../data/types";
import { isSuspiciousReading } from "../../selectors";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useAdmin } from "../AdminContext";
import { Badge, Btn, ChannelBadge, DataTable, PageHeader, Panel, SearchInput, Select, Tabs, type Column } from "../ui/kit";

export function ManagePage() {
  const { t } = useAdmin();
  const tickets = useDemoStore((s) => s.tickets);
  const [tab, setTab] = useState<"meter" | "repair">("meter");
  return (
    <div className="space-y-4">
      <PageHeader title={t("จัดการ")} subtitle={t("มิเตอร์น้ำไฟฟ้า และงานแจ้งซ่อมบำรุง")} icon={Wrench} />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "meter", label: t("มิเตอร์น้ำไฟฟ้า") },
          { value: "repair", label: t("แจ้งซ่อมบำรุง"), count: tickets.filter((x) => x.status !== "done").length },
        ]}
      />
      {tab === "meter" ? <MeterPanel /> : <RepairBoard />}
    </div>
  );
}

const isSuspicious = isSuspiciousReading;

function MeterPanel() {
  const { t, d, lang, toast, go } = useAdmin();
  const idx = useDemoIndex();
  const meters = useDemoStore((s) => s.meters);
  const zones = useDemoStore((s) => s.zones);
  const today = useDemoStore((s) => s.today);
  const recordMeter = useDemoStore((s) => s.recordMeter);
  const billUtilities = useDemoStore((s) => s.billUtilities);
  const period = firstOfMonth(today);
  const [zoneId, setZoneId] = useState("all");
  const [type, setType] = useState<"all" | "water" | "electric">("all");
  const [filter, setFilter] = useState<"all" | "pending" | "suspicious">("all");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const cycle = meters.filter((m) => m.period === period);
  const q = query.trim().toLowerCase();
  const rows = cycle.filter((m) => {
    const a = idx.areaById.get(m.areaId)!;
    if (zoneId !== "all" && a.zoneId !== zoneId) return false;
    if (type !== "all" && m.type !== type) return false;
    if (filter === "pending" && m.current !== null) return false;
    if (filter === "suspicious" && !isSuspicious(m)) return false;
    if (!q) return true;
    const c = idx.customerById.get(m.customerId);
    return [a.name, m.meterNo, c?.shop.th, c?.shop.en].some((v) => v?.toLowerCase().includes(q));
  });
  const done = cycle.filter((m) => m.current !== null).length;
  const suspicious = cycle.filter(isSuspicious).length;
  const unbilled = cycle.filter((m) => m.current !== null && !m.billed && !isSuspicious(m)).length;

  function save(m: MeterReading) {
    const raw = drafts[m.id];
    if (raw === undefined) return;
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value < m.previous) {
      toast(t("เกิดข้อผิดพลาดหรือตัวเลขไม่ถูกต้อง!"), "error");
      return;
    }
    recordMeter(m.id, value, { channel: "web" });
    setDrafts((x) => {
      const next = { ...x };
      delete next[m.id];
      return next;
    });
    toast(t("บันทึกสำเร็จ...!"), "success");
  }

  const columns: Column<MeterReading>[] = [
    { key: "area", header: t("รหัสพื้นที่"), render: (m) => <b className="text-slate-800">{idx.areaById.get(m.areaId)!.name}</b>, sort: (m) => idx.areaById.get(m.areaId)!.name },
    { key: "shop", header: t("ชื่อร้านค้า"), render: (m) => <span className="block max-w-[170px] truncate">{d(idx.customerById.get(m.customerId)!.shop)}</span>, sort: (m) => d(idx.customerById.get(m.customerId)!.shop) },
    {
      key: "type",
      header: t("ประเภท"),
      render: (m) =>
        m.type === "water" ? (
          <Badge tone="blue" icon={Droplets}>
            {t("น้ำ")}
          </Badge>
        ) : (
          <Badge tone="amber" icon={Zap}>
            {t("ไฟ")}
          </Badge>
        ),
      sort: (m) => m.type,
    },
    { key: "no", header: t("เลขเครื่อง"), render: (m) => <span className="text-slate-500">{m.meterNo}</span> },
    { key: "prev", header: t("เลขครั้งก่อน"), align: "right", render: (m) => int(m.previous) },
    {
      key: "cur",
      header: t("เลขปัจจุบัน"),
      align: "right",
      render: (m) => (
        <input
          value={drafts[m.id] ?? (m.current !== null ? String(m.current) : "")}
          onChange={(e) => setDrafts((x) => ({ ...x, [m.id]: e.target.value.replace(/\D/g, "") }))}
          onKeyDown={(e) => e.key === "Enter" && save(m)}
          onBlur={() => drafts[m.id] !== undefined && save(m)}
          onClick={(e) => e.stopPropagation()}
          placeholder={t("กรอก")}
          inputMode="numeric"
          className={cn(
            "h-8 w-24 rounded-lg border px-2 text-right tabular-nums outline-none focus:border-leaf-600 focus:ring-2 focus:ring-leaf-100",
            isSuspicious(m) ? "border-orange-400 bg-orange-50" : m.current === null ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200",
          )}
        />
      ),
    },
    {
      key: "usage",
      header: t("หน่วยที่ใช้"),
      align: "right",
      render: (m) =>
        m.current === null ? (
          <span className="text-slate-400">-</span>
        ) : (
          <span className={cn("font-semibold", isSuspicious(m) && "text-orange-700")}>
            {isSuspicious(m) && <TriangleAlert className="mr-1 inline size-3.5" />}
            {int(m.current - m.previous)}
          </span>
        ),
      sort: (m) => (m.current === null ? -1 : m.current - m.previous),
    },
    { key: "price", header: t("ราคาต่อหน่วย"), align: "right", render: (m) => money(m.unitPrice) },
    { key: "amount", header: t("ยอดชำระ"), align: "right", render: (m) => (m.current === null ? "-" : <b>฿{money((m.current - m.previous) * m.unitPrice)}</b>) },
    {
      key: "by",
      header: t("บันทึกโดย"),
      render: (m) =>
        m.recordedVia ? (
          <span className="flex items-center gap-1.5">
            <ChannelBadge channel={m.recordedVia} />
            {m.photo && <ImageIcon className="size-3.5 text-slate-400" />}
            <span className="text-[11px] text-slate-400">{m.recordedAt ? `${shortDate(m.recordedAt, lang)} ${time(m.recordedAt)}` : ""}</span>
          </span>
        ) : (
          <Badge tone="amber">{t("ยังไม่จด")}</Badge>
        ),
    },
    { key: "billed", header: "", render: (m) => (m.billed ? <span title={t("ออกใบวางบิลแล้ว")}><FileText className="size-4 text-emerald-600" /></span> : null) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[12.5px] font-semibold text-slate-500">
            <span>{t("รอบบิล {m}", { m: monthYear(period, lang, true) })}</span>
            <span className="text-slate-800">{t("จดแล้ว {a}/{b}", { a: done, b: cycle.length })}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cyan-100">
            <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${(done / Math.max(1, cycle.length)) * 100}%` }} />
          </div>
          <div className="mt-2 text-[11.5px] text-slate-500">{t("พนักงานจดผ่านเครื่อง Handheld พร้อมรูปหน้าปัด — ตัวเลขเข้ามาที่ตารางนี้ทันที")}</div>
        </div>
        <button type="button" onClick={() => setFilter(filter === "suspicious" ? "all" : "suspicious")} className={cn("rounded-2xl border p-4 text-left shadow-sm transition", filter === "suspicious" ? "border-orange-400 bg-orange-50" : "border-slate-200/80 bg-white hover:border-orange-300")}>
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500">
            <TriangleAlert className="size-4 text-orange-500" /> {t("กรองข้อมูลน่าสงสัย")}
          </div>
          <div className="mt-1 text-[24px] font-bold text-slate-900">{suspicious}</div>
          <div className="text-[11.5px] text-slate-500">{t("ยอดใช้สูงกว่าปกติมาก ควรตรวจเลขอีกครั้ง")}</div>
        </button>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="text-[12.5px] font-semibold text-slate-500">{t("พร้อมออกใบวางบิล")}</div>
          <div className="mt-1 text-[24px] font-bold text-slate-900">{unbilled}</div>
          <Btn
            className="mt-1 w-full"
            size="sm"
            icon={FileText}
            disabled={!unbilled}
            onClick={() => {
              const { created, skipped } = billUtilities();
              toast(t("บันทึกรายการวางบิลสำเร็จ {n} ใบ — ไปเก็บเงินที่เครื่อง Handheld ได้เลย", { n: created }), "success");
              if (skipped) toast(t("ข้ามเลขที่น่าสงสัย {n} รายการ — ตรวจและแก้ก่อนออกใบ", { n: skipped }), "warning");
            }}
          >
            {t("บันทึกวางบิล")}
          </Btn>
          <button type="button" onClick={() => go("account", { tab: "invoice" })} className="mt-1.5 w-full text-center text-[11px] font-semibold text-leaf-700 hover:underline">
            {t("ดูใบวางบิล")}
          </button>
        </div>
      </div>

      <Panel bodyClass="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={zoneId} onChange={setZoneId} label={t("โซน:")} options={[{ value: "all", label: t("ทั้งหมด") }, ...zones.filter((z) => z.code !== "E").map((z) => ({ value: z.id, label: d(z.name) }))]} />
          <Select value={type} onChange={setType} label={t("ประเภท")} options={[{ value: "all", label: t("ทั้งหมด") }, { value: "water", label: t("มิเตอร์น้ำ") }, { value: "electric", label: t("มิเตอร์ไฟ") }]} />
          <Select value={filter} onChange={setFilter} label={t("แสดง")} options={[{ value: "all", label: t("ข้อมูลทั้งหมด") }, { value: "pending", label: t("ยังไม่จด") }, { value: "suspicious", label: t("กรองข้อมูลน่าสงสัย") }]} />
          <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหา: ล็อก / ร้าน / เลขเครื่อง")} className="w-64" />
          <span className="ml-auto text-[11.5px] text-slate-500">{t("กรอกเลขแล้วกด Enter เพื่อบันทึก")}</span>
        </div>
        <DataTable key={`${zoneId}-${type}-${filter}-${q}`} rows={rows} columns={columns} rowKey={(m) => m.id} pageSize={12} initialSort={{ key: "area", dir: "asc" }} rowClass={(m) => (isSuspicious(m) ? "bg-orange-50/50" : undefined)} />
      </Panel>
    </div>
  );
}

function RepairBoard() {
  const { t, d, lang, toast } = useAdmin();
  const idx = useDemoIndex();
  const tickets = useDemoStore((s) => s.tickets);
  const setTicketStatus = useDemoStore((s) => s.setTicketStatus);
  const columns: { status: MaintenanceTicket["status"]; label: string; tone: string }[] = [
    { status: "pending", label: t("รอดำเนินการ"), tone: "bg-amber-400" },
    { status: "inProgress", label: t("กำลังดำเนินการ"), tone: "bg-sky-500" },
    { status: "done", label: t("เสร็จสิ้น"), tone: "bg-emerald-500" },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const list = tickets.filter((x) => x.status === col.status);
        return (
          <div key={col.status} className="rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-2 px-1 text-[13px] font-bold text-slate-700">
              <span className={cn("size-2.5 rounded-full", col.tone)} />
              {col.label}
              <span className="rounded-full bg-slate-200 px-1.5 text-[11px]">{list.length}</span>
            </div>
            <div className="space-y-2.5">
              {list.map((tk) => {
                const area = idx.areaById.get(tk.areaId)!;
                const c = idx.contractByArea.get(area.id);
                const cust = c ? idx.customerById.get(c.customerId) : undefined;
                return (
                  <div key={tk.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Badge tone="leaf">
                        {t("พื้นที่ :")} {area.name}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {t("วันที่แจ้งซ่อม :")} {shortDate(tk.reportedAt, lang)}
                      </span>
                    </div>
                    <div className="mt-2 text-[13.5px] font-bold text-slate-900">{d(tk.title)}</div>
                    <div className="text-[12px] text-slate-500">{d(tk.detail)}</div>
                    {cust && <div className="mt-1 text-[11.5px] text-slate-400">{d(cust.shop)}</div>}
                    <div className="mt-3 flex justify-end gap-1.5">
                      {tk.status === "pending" && (
                        <Btn
                          size="sm"
                          icon={PlayCircle}
                          onClick={() => {
                            setTicketStatus(tk.id, "inProgress");
                            toast(t("เริ่มดำเนินการ {v}", { v: d(tk.title) }), "info");
                          }}
                        >
                          {t("เริ่มดำเนินการ")}
                        </Btn>
                      )}
                      {tk.status === "inProgress" && (
                        <Btn
                          size="sm"
                          icon={Check}
                          onClick={() => {
                            setTicketStatus(tk.id, "done");
                            toast(t("ปิดงานซ่อม {v} แล้ว — ป้ายแจ้งซ่อมบนผังหายไปทั้งเว็บและ Handheld", { v: area.name }), "success");
                          }}
                        >
                          {t("เสร็จสิ้น")}
                        </Btn>
                      )}
                      {tk.status === "done" && (
                        <>
                          <span className="mr-auto flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3.5" /> {shortDate(tk.updatedAt, lang)}
                          </span>
                          <Btn size="sm" variant="ghost" icon={RotateCcw} onClick={() => setTicketStatus(tk.id, "pending")}>
                            {t("เปิดงานใหม่")}
                          </Btn>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-[12px] text-slate-400">{t("ไม่มีรายการ")}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
