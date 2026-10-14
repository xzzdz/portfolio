"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { locales, swapLocaleInPath, type Locale } from "@/lib/i18n";

/** สลับภาษาโดยคงหน้าเดิมไว้ และจำภาษาที่เลือกให้หน้า `/` ครั้งหน้า */
export function LangSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  return (
    <div className={cn("flex h-9 items-center rounded-full border border-line bg-white/70 p-0.5 font-mono text-[11px] font-semibold tracking-wider", className)}>
      {locales.map((l) => (
        <Link
          key={l}
          href={swapLocaleInPath(pathname, l)}
          scroll={false}
          onClick={() => {
            try {
              localStorage.setItem("portfolio-locale", l);
            } catch {
              // ไม่เป็นไร — แค่จำภาษาไม่ได้
            }
          }}
          aria-current={l === locale ? "true" : undefined}
          className={cn("grid h-8 min-w-10 place-items-center rounded-full px-2.5 uppercase transition", l === locale ? "bg-ink text-white" : "text-mute hover:text-ink")}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
