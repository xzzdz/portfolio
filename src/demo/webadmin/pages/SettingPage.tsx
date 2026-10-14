"use client";

import { Check, RotateCcw, Settings, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useDemoStore } from "../../store";
import { BankLogo } from "../../shared/BankLogo";
import { useAdmin } from "../AdminContext";
import { adminMenu } from "../AdminShell";
import { A4Doc, type DocTemplate } from "../ui/Document";
import { Badge, Btn, PageHeader, Panel, Tabs } from "../ui/kit";

type Tab = "place" | "payment" | "document" | "access" | "device";

export function SettingPage() {
  const { t } = useAdmin();
  const [tab, setTab] = useState<Tab>("place");
  return (
    <div className="space-y-4">
      <PageHeader title={t("ตั้งค่า")} subtitle={t("ข้อมูลสาขา ช่องทางรับชำระ เอกสาร สิทธิ์ผู้ใช้ และเครื่อง Handheld")} icon={Settings} />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "place", label: t("ข้อมูลสถานที่") },
          { value: "payment", label: t("ช่องทางชำระ") },
          { value: "document", label: t("รูปแบบเอกสาร") },
          { value: "access", label: t("ผู้ใช้งาน & สิทธิ์") },
          { value: "device", label: t("เครื่อง Handheld") },
        ]}
      />
      {tab === "place" && <PlaceTab />}
      {tab === "payment" && <PaymentTab />}
      {tab === "document" && <DocumentTab />}
      {tab === "access" && <AccessTab />}
      {tab === "device" && <DeviceTab />}
    </div>
  );
}

function ReadField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <label className={cn("block", wide && "col-span-2")}>
      <span className="text-[12px] font-semibold text-slate-500">{label}</span>
      <input readOnly value={value} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800 outline-none" />
    </label>
  );
}

function PlaceTab() {
  const { t, d, toast } = useAdmin();
  const market = useDemoStore((s) => s.market);
  const zones = useDemoStore((s) => s.zones);
  const areas = useDemoStore((s) => s.areas);
  const reset = useDemoStore((s) => s.reset);
  return (
    <div className="grid grid-cols-3 gap-4">
      <Panel className="col-span-2" title={t("ข้อมูลสถานที่")}>
        <div className="grid grid-cols-2 gap-3">
          <ReadField label={t("ชื่อสถานที่")} value={d(market.name)} />
          <ReadField label={t("สาขา")} value={d(market.branch)} />
          <ReadField label={t("ที่อยู่")} value={d(market.address)} wide />
          <ReadField label={t("เลขประจำตัวผู้เสียภาษี")} value={market.taxId} />
          <ReadField label={t("เบอร์โทร")} value={market.phone} />
          <ReadField label={t("แจ้งเตือนใกล้หมดสัญญาล่วงหน้า (วัน)")} value={String(market.nearExpireDays)} />
          <ReadField label={t("ประเภทพื้นที่")} value={t("ตลาดนัด")} />
        </div>
      </Panel>
      <Panel title={t("โซนพื้นที่เช่า")}>
        <ul className="space-y-2">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[12.5px]">
              <span className="font-semibold text-slate-700">{d(z.name)}</span>
              <span className="text-slate-500">{t("{n} ล็อก", { n: areas.filter((a) => a.zoneId === z.id).length })}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-3">
          <div className="text-[12.5px] font-semibold text-slate-700">{t("รีเซ็ตข้อมูลเดโม่")}</div>
          <p className="mt-0.5 text-[11.5px] text-slate-500">{t("คืนค่าข้อมูลทั้งหมด (ใบเสร็จ มิเตอร์ QR) เป็นชุดตั้งต้นของวันนี้ — มีผลกับเครื่อง Handheld ด้วย")}</p>
          <Btn
            className="mt-2"
            size="sm"
            variant="outline"
            icon={RotateCcw}
            onClick={() => {
              reset();
              toast(t("รีเซ็ตข้อมูลเรียบร้อย"), "success");
            }}
          >
            {t("รีเซ็ต")}
          </Btn>
        </div>
      </Panel>
    </div>
  );
}

function PaymentTab() {
  const { t, d } = useAdmin();
  const accounts = useDemoStore((s) => s.accounts);
  const [intents, setIntents] = useState(true);
  return (
    <div className="grid grid-cols-3 gap-4">
      <Panel className="col-span-2" title={t("ช่องทางรับชำระของสาขา")} subtitle={t("ใช้ร่วมกันทั้งเว็บและเครื่อง Handheld")}>
        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
              <BankLogo bank={a.bank} size={34} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-slate-800">{d(a.name)}</div>
                <div className="text-[11.5px] text-slate-500">
                  {d(a.accountName)} · {a.accountNo}
                </div>
              </div>
              <Badge tone="green">
                <Check className="size-3" /> {t("พร้อมใช้งาน")}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Payment Intents">
        <p className="text-[12.5px] leading-relaxed text-slate-600">{t("ระบบรับชำระแบบใหม่ : สร้างรายการรอชำระ → ออก QR → ตัดยอดอัตโนมัติเมื่อมีเงินเข้า ไม่ต้องรอตรวจสลิป")}</p>
        <button type="button" onClick={() => setIntents(!intents)} className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] font-semibold text-slate-700">
          {t("เปิดใช้กับสาขานี้")}
          <span className={cn("relative h-6 w-11 rounded-full transition", intents ? "bg-leaf-600" : "bg-slate-300")}>
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", intents ? "left-[22px]" : "left-0.5")} />
          </span>
        </button>
        <p className="mt-2 text-[11px] text-slate-400">{t("สาขาที่ปิดไว้จะใช้ระบบตะกร้าเดิม (ตัดยอดทันทีเมื่อกดรับชำระ)")}</p>
      </Panel>
    </div>
  );
}

function DocumentTab() {
  const { t, d, lang, toast } = useAdmin();
  const invoices = useDemoStore((s) => s.invoices);
  const [selected, setSelected] = useState<DocTemplate>("classic");
  const sample = invoices.find((iv) => iv.items.length >= 4) ?? invoices[0];
  const list: { id: DocTemplate; label: { th: string; en: string } }[] = [
    { id: "classic", label: { th: "แบบที่ 1 · บิลธรรมดา", en: "Template 1 · Standard bill" } },
    { id: "tax", label: { th: "แบบที่ 2 · ใบกำกับภาษี", en: "Template 2 · Tax invoice" } },
    { id: "bilingual", label: { th: "แบบที่ 3 · สองภาษา", en: "Template 3 · Bilingual" } },
  ];
  return (
    <Panel title={t("รูปแบบเอกสารใบวางบิล/ใบเสร็จ")} subtitle={t("แต่ละสาขาเลือกหัวกระดาษและรูปแบบได้เอง (ระบบจริงมีมากกว่า 10 แบบ รวมภาษาลาว)")}>
      <div className="grid grid-cols-3 gap-5">
        {list.map((tp) => (
          <button
            key={tp.id}
            type="button"
            onClick={() => {
              setSelected(tp.id);
              toast(t("ตั้งเป็นรูปแบบเริ่มต้น: {v}", { v: d(tp.label) }), "success");
            }}
            className={cn("rounded-2xl border-2 p-3 text-left transition", selected === tp.id ? "border-leaf-600 bg-leaf-50" : "border-slate-200 hover:border-slate-300")}
          >
            <div className="h-[300px] overflow-hidden rounded-lg bg-white shadow ring-1 ring-slate-200">
              <div style={{ zoom: 0.36 }} className="pointer-events-none">
                <A4Doc kind="invoice" id={sample.id} template={tp.id} lang={lang} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-800">{d(tp.label)}</span>
              {selected === tp.id && <Badge tone="leaf">{t("ค่าเริ่มต้น")}</Badge>}
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function AccessTab() {
  const { t, d } = useAdmin();
  const staff = useDemoStore((s) => s.staff);
  const levels: Record<string, string[]> = {
    "u-1": adminMenu.map((m) => m.page),
    "u-2": ["home", "account", "report", "registry"],
    "u-3": ["home", "area", "tenant", "account"],
    "u-4": adminMenu.map((m) => m.page),
  };
  return (
    <Panel title={t("สิทธิ์การเข้าถึงเมนู (Level)")} subtitle={t("เมนูที่ไม่มีสิทธิ์จะขึ้น \"Level ของคุณไม่สามารถเข้าถึงได้\"")} bodyClass="p-0">
      <table className="w-full text-[12.5px]">
        <thead className="bg-[#F4F4EC] text-[11.5px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold">{t("ผู้ใช้งาน")}</th>
            {adminMenu.map((m) => (
              <th key={m.page} className="px-2 py-2.5 text-center font-semibold">
                {t(m.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staff.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-4 py-2.5">
                <div className="font-semibold text-slate-800">{d(u.name)}</div>
                <div className="text-[11px] text-slate-500">
                  {d(u.role)} · {u.email}
                </div>
              </td>
              {adminMenu.map((m) => (
                <td key={m.page} className="px-2 text-center">
                  {levels[u.id]?.includes(m.page) ? <Check className="mx-auto size-4 text-leaf-700" /> : <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function DeviceTab() {
  const { t, d } = useAdmin();
  const staff = useDemoStore((s) => s.staff);
  const collector = staff.find((s) => s.device === "handheld");
  return (
    <Panel title={t("เครื่อง Handheld ที่ผูกกับสาขา")} subtitle={t("ใช้ backend และบัญชีผู้ใช้ชุดเดียวกับเว็บแอดมิน")}>
      <div className="grid grid-cols-2 gap-4">
        {[
          { serial: "V2-21-08-3F9A", user: collector ? d(collector.name) : "-", online: true },
          { serial: "V2-22-01-7C21", user: t("เครื่องสำรอง"), online: false },
        ].map((dev) => (
          <div key={dev.serial} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-900 text-white">
              <Smartphone className="size-6" />
            </span>
            <div className="min-w-0 flex-1 text-[12.5px]">
              <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
                Sunmi V2 <span className="font-mono text-[11px] font-medium text-slate-400">{dev.serial}</span>
              </div>
              <div className="text-slate-500">
                {dev.user} · Chaoperty Handheld v2.0.0 · Android 7.1
              </div>
              <div className="mt-1 flex gap-1.5">
                <Badge tone={dev.online ? "green" : "slate"}>{dev.online ? t("ออนไลน์") : t("ออฟไลน์")}</Badge>
                <Badge tone="slate">{t("เครื่องพิมพ์ 58mm")}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
