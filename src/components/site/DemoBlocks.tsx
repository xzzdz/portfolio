import { Cpu, Languages, MemoryStick, Printer, ScanLine, Smartphone } from "lucide-react";
import { HandheldEmbed, WebAdminEmbed } from "@/components/demo/DemoEmbeds";
import type { Locale } from "@/lib/i18n";

const HANDHELD_SCALE = 0.92;
// ขนาดจริงของกรอบเครื่อง (ดู HandheldDemo) — จองพื้นที่ไว้ก่อนสคริปต์โหลด เลย์เอาต์จะได้ไม่กระโดด
const DEVICE_W = 384;
const DEVICE_H = 176 + 828;

export function HandheldDemoBlock({ locale }: { locale: Locale }) {
  const th = locale === "th";
  const specs = [
    { icon: Smartphone, k: th ? "จอ" : "Screen", v: '5.99" · 720 × 1440 (360 × 720 dp)' },
    { icon: Cpu, k: "CPU / OS", v: "32-bit ARM · Android 7.1 (API 25)" },
    { icon: MemoryStick, k: "RAM", v: th ? "800 MB (ว่างจริง ~300 MB)" : "800 MB (~300 MB free)" },
    { icon: Printer, k: th ? "เครื่องพิมพ์" : "Printer", v: th ? "ความร้อน 58 mm ในตัว" : "Built-in 58 mm thermal" },
    { icon: ScanLine, k: th ? "สแกน" : "Scanner", v: th ? "กล้อง QR / Barcode" : "Camera QR / barcode" },
    { icon: Languages, k: th ? "ภาษา" : "Languages", v: "ไทย · English · 中文 · ລາວ" },
  ];
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[auto_minmax(0,1fr)]">
      <div className="mx-auto" style={{ width: DEVICE_W * HANDHELD_SCALE, height: DEVICE_H * HANDHELD_SCALE }}>
        <HandheldEmbed locale={locale} scale={HANDHELD_SCALE} />
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Target device · Sunmi V2</div>
          <dl className="mt-4 space-y-3">
            {specs.map((s) => (
              <div key={s.k} className="flex items-start gap-3 text-[14px]">
                <s.icon className="mt-0.5 size-4 shrink-0 text-sapphire-600" />
                <dt className="w-24 shrink-0 text-mute">{s.k}</dt>
                <dd className="text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-sapphire-200 bg-sapphire-50/70 p-5 text-[14px] leading-relaxed text-ink-2">
          {th
            ? "ปุ่มล่างสุดคือปุ่มนำทางของ Android (ย้อนกลับ / หน้าหลัก) ส่วนปุ่มลอยกลมๆ คือทางลัดแบบ AssistiveTouch ลากไปวางขอบไหนก็ได้ — ใบเสร็จที่สั่งพิมพ์จะออกมาจากช่องด้านบนของเครื่อง แตะที่กระดาษเพื่ออ่านเต็มๆ"
            : "The bottom bar is Android's navigation (back / home). The floating round button is an AssistiveTouch-style shortcut you can drag to any edge. Printed receipts feed out of the slot on top — tap the paper to read it."}
        </div>
      </aside>
    </div>
  );
}

export function WebAdminDemoBlock({ locale }: { locale: Locale }) {
  return (
    <div className="aspect-[1280/820] w-full">
      <WebAdminEmbed locale={locale} height={820} />
    </div>
  );
}
