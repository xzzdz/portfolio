"use client";

import { Building, Contact, Plus, User } from "lucide-react";
import { useState } from "react";
import { shortDate } from "@/lib/format";
import type { Customer } from "../../data/types";
import { useDemoStore } from "../../store";
import { useAdmin } from "../AdminContext";
import { Badge, Btn, DataTable, PageHeader, Panel, SearchInput, Select, type Column } from "../ui/kit";

export function RegistryPage() {
  const { t, d, lang, toast } = useAdmin();
  const customers = useDemoStore((s) => s.customers);
  const contracts = useDemoStore((s) => s.contracts);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "person" | "company">("all");
  const q = query.trim().toLowerCase();
  const rows = customers.filter((c) => (type === "all" || c.type === type) && (!q || [c.custNo, c.name.th, c.name.en, c.shop.th, c.shop.en, c.phone, c.email].some((v) => v.toLowerCase().includes(q))));

  const columns: Column<Customer>[] = [
    { key: "no", header: t("รหัส"), render: (c) => <b className="text-slate-800">{c.custNo}</b>, sort: (c) => c.custNo },
    {
      key: "name",
      header: t("ชื่อ"),
      render: (c) => (
        <span className="flex items-center gap-2">
          <span className={c.type === "company" ? "text-violet-600" : "text-sky-600"}>{c.type === "company" ? <Building className="size-4" /> : <User className="size-4" />}</span>
          <span className="font-semibold text-slate-800">{d(c.name)}</span>
        </span>
      ),
      sort: (c) => d(c.name),
    },
    { key: "shop", header: t("ชื่อร้านค้า"), render: (c) => d(c.shop), sort: (c) => d(c.shop) },
    { key: "type", header: t("ประเภท"), render: (c) => <Badge tone={c.type === "company" ? "violet" : "blue"}>{c.type === "company" ? t("นิติบุคคล") : t("บุคคลธรรมดา")}</Badge>, sort: (c) => c.type },
    { key: "phone", header: t("เบอร์โทร"), render: (c) => c.phone },
    { key: "email", header: t("อีเมล"), render: (c) => <span className="text-slate-500">{c.email}</span> },
    { key: "contracts", header: t("สัญญา"), align: "right", render: (c) => contracts.filter((x) => x.customerId === c.id).length, sort: (c) => contracts.filter((x) => x.customerId === c.id).length },
    { key: "since", header: t("ลูกค้าตั้งแต่"), render: (c) => shortDate(c.since, lang), sort: (c) => c.since },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("ทะเบียน")}
        subtitle={t("ทะเบียนลูกค้าของสาขา {n} ราย", { n: customers.length })}
        icon={Contact}
        actions={
          <Btn icon={Plus} onClick={() => toast(t("เปิดฟอร์มเพิ่มลูกค้า (เดโม่แสดงขั้นตอนหลักเท่านั้น)"), "info")}>
            {t("เพิ่มลูกค้า")}
          </Btn>
        }
      />
      <Panel bodyClass="space-y-3">
        <div className="flex flex-wrap gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder={t("ค้นหา: ชื่อ/นามสกุล/อีเมล…")} className="w-80" />
          <Select value={type} onChange={setType} label={t("ประเภท")} options={[{ value: "all", label: t("ทั้งหมด") }, { value: "person", label: t("บุคคลธรรมดา") }, { value: "company", label: t("นิติบุคคล") }]} />
          <span className="ml-auto self-center text-[12px] text-slate-500">{t("ผลลัพธ์ {n} รายการ", { n: rows.length })}</span>
        </div>
        <DataTable key={`${type}-${q}`} rows={rows} columns={columns} rowKey={(c) => c.id} initialSort={{ key: "no", dir: "asc" }} />
      </Panel>
    </div>
  );
}
