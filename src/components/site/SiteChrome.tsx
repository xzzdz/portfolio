import { ArrowUpRight, Menu, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { profile } from "@/content/profile";
import { nav, ui } from "@/content/site";
import type { Locale } from "@/lib/i18n";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import { LangSwitch } from "./LangSwitch";

export function Monogram({ className = "size-9 text-[15px]" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-[10px] bg-ink font-mono font-semibold text-white ${className}`} aria-hidden>
      {profile.name.en.slice(0, 1)}
      <span className="-ml-px text-sapphire-300">.</span>
    </span>
  );
}

export function SiteHeader({ locale, wide }: { locale: Locale; wide?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className={`mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 ${wide ? "max-w-[1720px]" : "max-w-[1200px]"}`}>
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2.5">
          <Monogram />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold text-ink">
              <span className="sm:hidden">{profile.shortName[locale]}</span>
              <span className="hidden sm:inline">{profile.name[locale]}</span>
            </span>
            <span className="block truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">{profile.role.en}</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.id} href={`/${locale}#${n.id}`} className="rounded-full px-3 py-2 text-[14px] text-ink-2 transition hover:bg-white hover:text-ink">
              {n.label[locale]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link href={`/${locale}/demo`} className="hidden h-9 items-center gap-1.5 rounded-full bg-sapphire-600 px-4 text-[13.5px] font-medium text-white shadow-sm transition hover:bg-sapphire-700 sm:flex">
            <MonitorSmartphone className="size-4" />
            {ui.liveDemo[locale]}
          </Link>
          <LangSwitch locale={locale} />
          <details className="group relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full border border-line bg-white/70 [&::-webkit-details-marker]:hidden" aria-label="Menu">
              <Menu className="size-4" />
            </summary>
            <div className="absolute right-0 top-11 w-56 rounded-2xl border border-line bg-white p-2 shadow-xl">
              {nav.map((n) => (
                <Link key={n.id} href={`/${locale}#${n.id}`} className="block rounded-xl px-3 py-2.5 text-[15px] text-ink-2 hover:bg-paper">
                  {n.label[locale]}
                </Link>
              ))}
              <Link href={`/${locale}/demo`} className="mt-1 flex items-center gap-2 rounded-xl bg-sapphire-600 px-3 py-2.5 text-[15px] font-medium text-white">
                <MonitorSmartphone className="size-4" />
                {ui.liveDemo[locale]}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Monogram className="size-8 text-[13px]" />
          <div className="text-[13px] leading-relaxed text-mute">
            <div className="text-ink">
              © {profile.name[locale]} · {profile.location[locale]}
            </div>
            <div>{ui.builtWith[locale]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={profile.github} target="_blank" rel="noreferrer" className="grid size-10 place-items-center rounded-full border border-line text-ink-2 transition hover:border-ink hover:text-ink" aria-label="GitHub">
            <GithubIcon className="size-[18px]" />
          </a>
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="grid size-10 place-items-center rounded-full border border-line text-ink-2 transition hover:border-ink hover:text-ink" aria-label="LinkedIn">
              <LinkedinIcon className="size-[18px]" />
            </a>
          )}
          <a href={`mailto:${profile.email}`} className="flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[13.5px] text-ink-2 transition hover:border-ink hover:text-ink">
            {profile.email}
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

/** หัวข้อของแต่ละส่วน : เลขลำดับแบบ mono + ชื่อ */
export function SectionHead({ index, kicker, title, lead, className = "" }: { index: string; kicker: string; title: string; lead?: string; className?: string }) {
  return (
    <div className={`mb-10 max-w-3xl ${className}`}>
      <div className="mb-3 flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.18em] text-mute">
        <span className="text-sapphire-600">{index}</span>
        <span className="h-px w-8 bg-line" />
        {kicker}
      </div>
      <h2 className="text-balance text-[30px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[38px]">{title}</h2>
      {lead && <p className="mt-4 text-pretty text-[17px] leading-[1.75] text-ink-2">{lead}</p>}
    </div>
  );
}
