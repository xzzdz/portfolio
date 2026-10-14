"use client";

import { BadgeCheck, Building, CheckCircle2, Contact, Eye, Landmark, Printer, ScrollText, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { money, shortDate, thaiBahtText } from "@/lib/format";
import { BankLogo } from "../../shared/BankLogo";
import { useDemoStore } from "../../store";
import { useDemoIndex } from "../../useIndex";
import { useApp } from "../AppContext";
import { SheetFrame } from "../ui/Overlays";
import { Button, Card, DetailRow, EmptyState, Pill, SubHeader } from "../ui/parts";

// ─────────────────────────── ทะเบียนลูกค้า (ดูอย่างเดียว) ───────────────────────────

export function CustomerScreen() {
  const { t, d, openSheet } = useApp();
  const customers = useDemoStore((s) => s.customers);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "person" | "company">("all");
  const q = query.trim().toLowerCase();
  const list = customers.filter((c) => {
    if (type !== "all" && c.type !== type) return false;
    if (!q) return true;
    return [c.name.th, c.name.en, c.shop.th, c.shop.en, c.custNo, c.phone].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("ทะเบียนลูกค้า")} right={<span className="mr-1 rounded-lg bg-white/15 px-2 py-1 text-[10.5px] font-bold">[{t("ดูอย่างเดียว")}]</span>} />
      <div className="shrink-0 space-y-2 px-3 pb-2 pt-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ค้นหาชื่อลูกค้า, รหัส, เลขภาษี, เบอร์โทร...")}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#0F52BA]"
        />
        <div className="flex gap-1.5">
          {(["all", "person", "company"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setType(k)}
              className={cn("h-8 rounded-2xl border px-3 text-[12px] font-bold", type === k ? "border-[#0F52BA] bg-[#EFF6FF] text-[#0F52BA]" : "border-slate-200 bg-white text-slate-600")}
            >
              {k === "all" ? t("ทั้งหมด") : k === "person" ? t("บุคคลธรรมดา") : t("นิติบุคคล")}
            </button>
          ))}
          <span className="ml-auto self-center text-[11.5px] text-slate-500">{t("พบทั้งหมด {count} รายการ", { count: list.length })}</span>
        </div>
      </div>
      <div className="thin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-24 pt-1">
        {list.length === 0 && <EmptyState icon={Contact} title={t("ไม่พบข้อมูลทะเบียนลูกค้า")} subtitle={t("ลองเปลี่ยนคำค้นหาหรือตัวกรองประเภท")} />}
        {list.map((c) => (
          <Card key={c.id} className="flex items-center gap-3 p-3" onClick={() => openSheet(<CustomerSheet id={c.id} />)}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-white", c.type === "company" ? "bg-violet-500" : "bg-[#0F52BA]")}>
              {c.type === "company" ? <Building className="size-5" /> : <User className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-bold text-slate-900">{d(c.name)}</div>
              <div className="truncate text-[11.5px] text-slate-500">
                {c.custNo} · {d(c.shop)}
              </div>
            </div>
            <span className="text-[11.5px] text-slate-500">{c.phone}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomerSheet({ id }: { id: string }) {
  const { t, d, lang } = useApp();
  const idx = useDemoIndex();
  const contracts = useDemoStore((s) => s.contracts);
  const c = idx.customerById.get(id)!;
  const own = contracts.filter((x) => x.customerId === id);
  return (
    <SheetFrame title={d(c.name)} subtitle={`${c.custNo} · ${d(c.shop)}`} icon={Contact} headerRight={<Pill tone="slate"><Eye className="size-3" /> {t("ดูอย่างเดียว")}</Pill>}>
      <div className="rounded-2xl bg-slate-50 px-3.5 py-1.5">
        <DetailRow label={t("ประเภทลูกค้า")} value={c.type === "company" ? t("นิติบุคคล") : t("บุคคลธรรมดา")} />
        <DetailRow label={t("เบอร์โทรศัพท์:")} value={c.phone} />
        <DetailRow label={t("อีเมล:")} value={c.email} />
        <DetailRow label={t("เลขประจำตัว/บัตร:")} value={c.idCard.replace(/\d(?=.{4})/g, "x")} />
        <DetailRow label={t("ที่อยู่ตามทะเบียน:")} value={d(c.address)} />
        <DetailRow label={t("ลูกค้าตั้งแต่")} value={shortDate(c.since, lang)} />
      </div>
      <div className="mt-4 text-[13px] font-bold text-slate-800">{t("สัญญา / ใบเสนอราคา")}</div>
      <div className="mt-2 space-y-1.5 pb-2">
        {own.map((x) => (
          <div key={x.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-[12.5px]">
            <span className="font-bold">{x.no}</span>
            <span className="text-slate-500">{t("ล็อค {ln}", { ln: idx.areaNames(x.areaIds) })}</span>
          </div>
        ))}
      </div>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-800">{t("เพิ่ม/แก้ไขทะเบียนลูกค้าทำที่เว็บแอดมิน — เครื่อง Handheld เปิดให้ดูอย่างเดียว")}</p>
    </SheetFrame>
  );
}

// ─────────────────────────── บัญชีรับชำระ ───────────────────────────

export function AccountScreen() {
  const { t, d } = useApp();
  const accounts = useDemoStore((s) => s.accounts);
  const receipts = useDemoStore((s) => s.receipts);
  const today = useDemoStore((s) => s.today);
  const month = today.slice(0, 7);
  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("บัญชี")} />
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-24 pt-3">
        <div className="rounded-2xl bg-linear-to-br from-slate-800 to-slate-950 p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 text-[12px] text-white/70">
            <Landmark className="size-4" /> {t("ช่องทางบัญชีรับชำระเงิน")}
          </div>
          <div className="mt-1 text-[15px] font-bold">{t("พบทั้งหมด {list} บัญชีพร้อมใช้งาน", { list: accounts.length })}</div>
        </div>
        <div className="mt-3 space-y-2">
          {accounts.map((a) => {
            const sum = receipts.filter((r) => r.accountId === a.id && r.paidAt.startsWith(month)).reduce((s, r) => s + r.total, 0);
            return (
              <Card key={a.id} className="p-3.5">
                <div className="flex items-center gap-3">
                  <BankLogo bank={a.bank} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900">
                      {d(a.name)}
                      <Pill tone="green">
                        <BadgeCheck className="size-3" /> {t("พร้อมใช้งาน")}
                      </Pill>
                    </div>
                    <div className="truncate text-[12px] text-slate-500">{d(a.accountName)}</div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-slate-200 pt-2 text-[12px]">
                  <span className="text-slate-500">{t("เลขที่บัญชี / อ้างอิง: {accNo}", { accNo: a.accountNo })}</span>
                  <span className="font-bold text-emerald-700">
                    {t("เดือนนี้")} ฿{money(sum)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── ตั้งค่าเครื่องพิมพ์ ───────────────────────────

export function PrintScreen() {
  const { t, print, notify } = useApp();
  const [amount, setAmount] = useState("1234.50");
  const num = Number(amount) || 0;
  return (
    <div className="flex h-full flex-col bg-[#F1F5F9]">
      <SubHeader title={t("ตั้งค่าเครื่องพิมพ์")} />
      <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-24 pt-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Printer className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold text-slate-900">{t("เครื่องพิมพ์ความร้อนในตัว")}</div>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" /> {t("พบหัวพิมพ์ในตัว (Sunmi) — พร้อมพิมพ์")}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            {[
              [t("กระดาษ"), "58 mm"],
              [t("พื้นที่พิมพ์"), "48 mm"],
              [t("ความละเอียด"), "384 dots"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 py-2">
                <div className="text-slate-500">{k}</div>
                <div className="font-bold text-slate-800">{v}</div>
              </div>
            ))}
          </div>
          <Button
            className="mt-3 w-full"
            icon={Printer}
            onClick={() => {
              print({ kind: "test" });
              notify(t("ทดสอบพิมพ์"), t("กำลังส่งสลิปทดสอบไปยัง {v}...", { v: "Sunmi V2" }), "info");
            }}
          >
            {t("ทดสอบพิมพ์")}
          </Button>
          <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">{t("ดูสลิปที่พิมพ์ออกมา : แถบดำต้องเต็มบรรทัดไม่ขาดขอบ และตัวหนังสือไทยต้องไม่ทับกัน")}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900">
            <ScrollText className="size-4 text-[#0F52BA]" /> {t("ตัวอย่างการแปลงยอดเงินเป็นข้อความภาษาไทย:")}
          </div>
          <label className="mt-2 flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#0F52BA]">
            <span className="text-slate-400">฿</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none" />
          </label>
          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 font-receipt text-[15px] leading-snug text-slate-800">({thaiBahtText(num)})</div>
        </Card>
      </div>
    </div>
  );
}
