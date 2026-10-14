import { Hand } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { ui } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/**
 * ภาพหลักของหน้าแรก : เครื่อง Handheld (ภาพจากเดโม่จริง) กำลังพิมพ์ "สลิปโปรไฟล์"
 * ออกจากหัวพิมพ์ — กระดาษอยู่หลังตัวเครื่องเหมือนของจริง ส่วนล่างของเครื่องจมหายใต้แถบตัวเลข
 */
export function HeroVisual({ locale }: { locale: Locale }) {
  const rows: [string, string][] = [
    ["ROLE", "Software Developer"],
    ["AT", "Dzentric Co., Ltd."],
    ["SINCE", locale === "th" ? "ต.ค. 2567 → ปัจจุบัน" : "Oct 2024 → now"],
    ["BASED", profile.location[locale]],
  ];
  const stack: [string, string][] = [
    ["STACK", "Flutter · Dart"],
    ["", "Riverpod · REST API"],
    ["LEARNING", "TS · Node · Next.js"],
  ];
  return (
    <div className="relative mx-auto h-full w-[260px] sm:w-[290px]">
      {/* กระดาษสลิป (อยู่หลังตัวเครื่อง) */}
      <div className="absolute inset-x-[12.5%] top-0 z-0 h-[236px] overflow-hidden [mask-image:linear-gradient(to_top,black_80%,transparent)] sm:h-[246px]">
        <div className="absolute inset-x-0 bottom-0 animate-[paper-feed_2.4s_steps(30)_0.6s_both] bg-[#FDFDFB] px-3.5 pb-9 pt-5 font-mono text-[9.5px] leading-[1.6] text-ink sm:px-4 sm:text-[10px] shadow-[0_0_18px_rgba(0,0,0,0.12)]">
          <div className="text-center text-[10.5px] font-semibold tracking-[0.25em]">✱ PROFILE SLIP ✱</div>
          <div className="mt-0.5 text-center font-sans text-[12.5px] font-semibold">{profile.name[locale]}</div>
          <div className="text-center text-[9.5px] text-mute">{profile.role.en}</div>
          <div className="perforated my-2 h-px text-ink/50" />
          {rows.map(([k, v]) => (
            <Row key={k} k={k} v={v} sans />
          ))}
          <div className="perforated my-2 h-px text-ink/50" />
          {stack.map(([k, v], i) => (
            <Row key={i} k={k} v={v} />
          ))}
          <div className="perforated my-2 h-px text-ink/50" />
          <div className="flex gap-2">
            <span className="w-[52px] shrink-0 text-mute sm:w-[58px]">STATUS</span>
            <span className="flex items-center gap-1.5 font-sans font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500" /> {profile.availability[locale]}
            </span>
          </div>
          <div className="mt-3 flex h-7 items-end justify-center gap-[2px]" aria-hidden>
            {"1101001110101100101101001101011".split("").map((b, i) => (
              <span key={i} className="bg-ink" style={{ width: b === "1" ? 2 : 1, height: i % 7 === 0 ? 28 : 22 }} />
            ))}
          </div>
        </div>
      </div>

      {/* ตัวเครื่อง (ภาพจากเดโม่) */}
      <Link href={`/${locale}/demo`} className="group absolute inset-x-0 top-[206px] z-10 block sm:top-[216px]" aria-label={ui.liveDemo[locale]}>
        <Image src={locale === "en" ? "/shots/handheld-device-en.webp" : "/shots/handheld-device.webp"} alt="Chaoperty Handheld" width={768} height={1648} priority className="h-auto w-full drop-shadow-[0_24px_36px_rgba(15,23,42,0.3)]" />
        <span className="absolute -left-6 top-[34%] flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12.5px] font-medium text-ink shadow-lg ring-1 ring-line transition group-hover:-translate-y-0.5 sm:-left-14">
          <Hand className="size-4 text-sapphire-600" />
          {locale === "th" ? "แตะเพื่อลองใช้จริง" : "Tap to try it"}
        </span>
      </Link>
    </div>
  );
}

function Row({ k, v, sans }: { k: string; v: string; sans?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-[52px] shrink-0 text-mute sm:w-[58px]">{k}</span>
      <span className={sans ? "font-sans" : undefined}>{v}</span>
    </div>
  );
}
