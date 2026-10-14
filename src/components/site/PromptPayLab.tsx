"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { crc16, DEMO_PROMPTPAY_ID, promptPayFields, tlv } from "@/lib/promptpay";

const fieldTone = ["bg-sky-100 text-sky-900", "bg-violet-100 text-violet-900", "bg-amber-100 text-amber-900", "bg-emerald-100 text-emerald-900", "bg-rose-100 text-rose-900", "bg-lime-100 text-lime-900"];

/** แยกให้เห็นทีละช่องว่า QR พร้อมเพย์ประกอบจากอะไร (TLV + CRC-16) */
export function PromptPayLab({ locale }: { locale: Locale }) {
  const [amount, setAmount] = useState("1250.50");
  const value = Math.max(0, Math.min(999_999, Number(amount) || 0));
  const fields = promptPayFields(DEMO_PROMPTPAY_ID, value) ?? [];
  const body = fields.map((f) => tlv(f.id, f.value)).join("") + "6304";
  const crc = crc16(body).toString(16).toUpperCase().padStart(4, "0");
  const payload = body + crc;
  const th = locale === "th";

  return (
    <div className="grid gap-6 rounded-[24px] border border-line bg-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        <label className="flex max-w-xs items-center gap-2 rounded-xl border border-line bg-paper px-3 focus-within:border-sapphire-600">
          <span className="text-mute">฿</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            aria-label={th ? "ยอดเงิน" : "Amount"}
            className="h-11 min-w-0 flex-1 bg-transparent font-mono text-[16px] font-semibold text-ink outline-none"
          />
          <span className="font-mono text-[11px] uppercase tracking-wider text-mute">THB</span>
        </label>

        <div className="mt-5 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-[13px]">
            <thead className="bg-paper text-left font-mono text-[11px] uppercase tracking-wider text-mute">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">LEN</th>
                <th className="px-3 py-2">{th ? "ความหมาย" : "Meaning"}</th>
                <th className="hidden px-3 py-2 sm:table-cell">{th ? "ค่า" : "Value"}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {fields.map((f, i) => (
                <tr key={f.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <span className={cn("rounded px-1.5 py-0.5 font-semibold", fieldTone[i % fieldTone.length])}>{f.id}</span>
                  </td>
                  <td className="px-3 py-2 text-mute">{String(f.value.length).padStart(2, "0")}</td>
                  <td className="px-3 py-2 font-sans text-ink-2">{f.label}</td>
                  <td className="hidden max-w-[220px] truncate px-3 py-2 text-ink sm:table-cell" title={f.value}>
                    {f.value}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-line bg-paper/60">
                <td className="px-3 py-2">
                  <span className="rounded bg-ink px-1.5 py-0.5 font-semibold text-white">63</span>
                </td>
                <td className="px-3 py-2 text-mute">04</td>
                <td className="px-3 py-2 font-sans text-ink-2">CRC-16/CCITT-FALSE</td>
                <td className="hidden px-3 py-2 font-semibold text-ink sm:table-cell">{crc}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 break-all rounded-xl bg-ink p-4 font-mono text-[12px] leading-relaxed text-white/90">
          {fields.map((f) => (
            <span key={f.id}>
              <span className="text-sapphire-300">{f.id}</span>
              <span className="text-white/40">{String(f.value.length).padStart(2, "0")}</span>
              {f.value}
            </span>
          ))}
          <span className="text-amber-300">6304</span>
          <span className="font-semibold text-emerald-300">{crc}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-paper p-5">
        <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-line">
          <QRCodeSVG value={payload} size={164} marginSize={0} fgColor="#111318" />
        </div>
        <div className="text-center text-[12px] leading-relaxed text-mute">
          {th ? "เลขปลายทาง 000-000-0000 ไม่ใช่บัญชีจริง — แอปธนาคารจะแจ้งว่าไม่พบบัญชี" : "Target 000-000-0000 isn't a real account — banking apps will report it as not found."}
        </div>
      </div>
    </div>
  );
}
