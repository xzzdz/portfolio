import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { HandheldEmbed, WebAdminEmbed } from "@/components/demo/DemoEmbeds";
import { profile } from "@/content/profile";
import { hasLocale } from "@/lib/i18n";

// หน้าสำหรับถ่ายภาพหน้าจอประกอบเว็บ (scripts/screenshots.mjs) — ไม่ได้ลิงก์จากที่ไหน
export const metadata: Metadata = { robots: { index: false, follow: false } };

const kinds = ["handheld-device", "handheld-screens", "webadmin", "og"] as const;

export async function generateStaticParams() {
  return kinds.map((kind) => ({ kind }));
}

/** ประโยคสั้นบนภาพ OG (tagline เต็มยาวเกินพื้นที่ภาพ) */
const ogLine = {
  th: "พัฒนาแอป Handheld POS เองทั้งแอป และเว็บแอดมินส่วนรับชำระ + ตรวจสลิปอัตโนมัติ",
  en: "Built a handheld POS app solo, plus the web admin's payments and automatic slip checks.",
};

export default async function ShotPage({ params }: PageProps<"/[lang]/shots/[kind]">) {
  const { lang, kind } = await params;
  if (!hasLocale(lang) || !(kinds as readonly string[]).includes(kind)) notFound();

  if (kind === "handheld-device") {
    return (
      <div id="shot" className="w-fit p-6">
        <HandheldEmbed locale={lang} />
      </div>
    );
  }

  if (kind === "og") {
    // ภาพตัวอย่างเวลาแชร์ลิงก์ (Open Graph 1200×630)
    return (
      <div id="shot" className="relative flex h-[630px] w-[1200px] overflow-hidden bg-paper">
        <div className="dot-grid absolute inset-0 opacity-70" />
        <div className="relative z-10 flex w-[640px] flex-col justify-center pl-16">
          <div className="flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-ink font-mono text-[26px] font-semibold text-white">
              {profile.name.en.slice(0, 1)}
              <span className="text-sapphire-300">.</span>
            </span>
            <span className="rounded-full border border-line bg-white px-3 py-1 font-mono text-[13px] uppercase tracking-[0.16em] text-mute">Portfolio</span>
          </div>
          {/* ชื่อเต็มยาว — ให้ขึ้นได้สองบรรทัดโดยไม่ดันส่วนอื่นตกขอบภาพ */}
          <div className="mt-8 max-w-[560px] text-balance text-[54px] font-semibold leading-[1.08] tracking-tight text-ink">{profile.name[lang]}</div>
          <div className="mt-3 text-[28px] font-medium text-sapphire-600">{profile.role[lang]}</div>
          <p className="mt-5 max-w-[520px] text-[21px] leading-[1.6] text-ink-2">{ogLine[lang]}</p>
          <div className="mt-7 font-mono text-[15px] uppercase tracking-[0.16em] text-mute">Flutter · Dart · REST API · TypeScript · Next.js</div>
        </div>
        <div className="absolute right-[-40px] top-[70px] w-[620px] rotate-[-4deg] overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10">
          <Image src={lang === "en" ? "/shots/webadmin-dashboard-en.webp" : "/shots/webadmin-dashboard.webp"} alt="" width={1594} height={1042} className="w-full" />
        </div>
        <div className="absolute bottom-[-220px] right-[300px] w-[230px] rotate-[3deg]">
          <Image src={lang === "en" ? "/shots/handheld-device-en.webp" : "/shots/handheld-device.webp"} alt="" width={768} height={1648} className="w-full drop-shadow-2xl" />
        </div>
      </div>
    );
  }

  if (kind === "handheld-screens") {
    const screens = [
      { screen: "home" as const, y: 60 },
      { screen: "area" as const, y: 0 },
      { screen: "payment" as const, y: 60 },
    ];
    return (
      <div id="shot" className="flex w-[1200px] items-start justify-center gap-6 p-8">
        {screens.map((s) => (
          <div key={s.screen} className="h-[720px] w-[360px] shrink-0 overflow-hidden rounded-[30px] bg-black ring-[6px] ring-[#1c1d21] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.6)]" style={{ marginTop: s.y }}>
            <HandheldEmbed locale={lang} framed={false} initialScreen={s.screen} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="shot" className="w-[1328px] p-6">
      <WebAdminEmbed locale={lang} height={820} />
    </div>
  );
}
