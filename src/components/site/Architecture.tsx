import { ArrowDown, ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { L, Locale } from "@/lib/i18n";

type Layer = { label: string; title: string; items: L[]; tone?: "ink" | "sapphire" | "leaf" | "amber" };

const tones = {
  ink: "border-ink/15 bg-white",
  sapphire: "border-sapphire-200 bg-sapphire-50",
  leaf: "border-leaf-300 bg-leaf-50",
  amber: "border-amber-200 bg-amber-50",
};

/** แผนภาพชั้นของระบบ : ข้อมูลไหลทางเดียวจากซ้ายไปขวา */
function LayerDiagram({ layers, footer, locale }: { layers: Layer[]; footer?: { title: L; items: string[] }; locale: Locale }) {
  return (
    <div className="rounded-[24px] border border-line bg-paper/60 p-5 sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {layers.map((layer, i) => (
          <Fragment key={layer.title}>
            <div className={cn("flex-1 rounded-2xl border p-4", tones[layer.tone ?? "ink"])}>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{layer.label}</div>
              <div className="mt-1 text-[15.5px] font-semibold text-ink">{layer.title}</div>
              <ul className="mt-3 space-y-1.5">
                {layer.items.map((it) => (
                  <li key={it.en} className="text-[13px] leading-snug text-ink-2">
                    {it[locale]}
                  </li>
                ))}
              </ul>
            </div>
            {i < layers.length - 1 && (
              <div className="grid place-items-center text-mute">
                <ArrowRight className="hidden size-5 lg:block" />
                <ArrowDown className="size-5 lg:hidden" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
      {footer && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line bg-white/70 px-4 py-3">
          <span className="mr-1 text-[13px] font-semibold text-ink">{footer.title[locale]}</span>
          {footer.items.map((x) => (
            <span key={x} className="rounded-lg bg-paper px-2 py-1 font-mono text-[11.5px] text-ink-2">
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function HandheldArchitecture({ locale }: { locale: Locale }) {
  return (
    <LayerDiagram
      locale={locale}
      layers={[
        { label: "View", title: "Screens · Sheets", items: [{ th: "หนึ่งโฟลเดอร์ต่อหนึ่งฟีเจอร์", en: "One folder per feature" }, { th: "tabs/ sheets/ widgets/ แยกไฟล์เมื่อเกิน ~800 บรรทัด", en: "tabs/ sheets/ widgets/ split past ~800 lines" }, { th: "widget กลาง: ลิสต์โหลดทีละ 20, สถานะว่าง/โหลด", en: "Shared widgets: 20-item lazy lists, empty/loading states" }] },
        { label: "State", title: "Riverpod", items: [{ th: "provider ทั้งหมดรวมที่ di.dart", en: "All providers wired in di.dart" }, { th: "StateNotifier บางๆ สำหรับ state ข้ามจอ", en: "Thin StateNotifiers for cross-screen state" }, { th: "go_router : ShellRoute + จอ drill-down", en: "go_router: ShellRoute + drill-down routes" }], tone: "sapphire" },
        { label: "Data", title: "Repository → ApiClient", items: [{ th: "interface ใน domain/ ตัวจริงใน data/", en: "Interfaces in domain/, implementations in data/" }, { th: "ที่เดียวที่รู้ชื่อพารามิเตอร์ของ backend", en: "The only layer that knows backend parameter names" }, { th: "Dio + endpoints.dart เป็นแคตตาล็อกเส้น API", en: "Dio + endpoints.dart as the API catalog" }] },
        { label: "Backend", title: locale === "th" ? "ใช้ร่วมกับเว็บแอดมิน" : "Shared with the web admin", items: [{ th: "PHP REST API (chao_api)", en: "PHP REST API (chao_api)" }, { th: "Payment Intents API (token ต่อสาขา)", en: "Payment Intents API (per-branch token)" }], tone: "leaf" },
      ]}
      footer={{ title: { th: "บริการในเครื่อง", en: "On-device services" }, items: ["SessionStore", "SunmiPrinterService", "mobile_scanner", "utils/pdf", "tr() · 4 languages"] }}
    />
  );
}

export function WebAdminArchitecture({ locale }: { locale: Locale }) {
  return (
    <LayerDiagram
      locale={locale}
      layers={[
        { label: "View", title: "AdminScaffold · Modules", items: [{ th: "พื้นที่เช่า · ผู้เช่า · บัญชี · จัดการ · รายงาน · ตั้งค่า", en: "Areas · tenants · accounting · manage · reports · settings" }, { th: "สิทธิ์เมนูตาม Level ผู้ใช้", en: "Menu permissions by user level" }] },
        { label: "State", title: "Provider · ViewModel", items: [{ th: "ChangeNotifier แยก state ออกจาก UI (โมดูลใหม่)", en: "ChangeNotifiers keep state out of the UI (new modules)" }, { th: "wrapper บางๆ ส่งต่อจากโค้ดเดิมไปโค้ดใหม่", en: "Thin wrappers bridge old screens to new code" }], tone: "leaf" },
        { label: "Data", title: "Services", items: [{ th: "service ต่อเส้น API (invoice, payment method, fine …)", en: "One service per endpoint (invoice, payment method, fine …)" }, { th: "แยก config ของ Payment Intents ไว้ที่เดียว", en: "Payment Intents config in one place" }] },
        { label: "Output", title: locale === "th" ? "เอกสาร & รายงาน" : "Documents & reports", items: [{ th: "PDF ใบวางบิล/ใบเสร็จ หลายเทมเพลต รวมภาษาลาว", en: "PDF invoices/receipts, many templates, incl. Lao" }, { th: "ส่งออก Excel · พิมพ์", en: "Excel export · printing" }], tone: "amber" },
      ]}
      footer={{ title: { th: "เชื่อมต่อ", en: "Talks to" }, items: ["PHP REST API (chao_api)", "Payment Intents API", "Handheld V2 (same backend)"] }}
    />
  );
}
