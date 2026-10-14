import { ArrowLeft, ArrowRight, CheckCircle2, Maximize2, MousePointerClick } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { getProject, projects, type ProjectSlug } from "@/content/projects";
import { ui } from "@/content/site";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { featureIcons } from "./icons";

const wrap = "mx-auto max-w-[1200px] px-4 sm:px-6";

export function CaseStudy({ slug, locale, demo, architecture, extra }: { slug: ProjectSlug; locale: Locale; demo: ReactNode; architecture: ReactNode; extra?: ReactNode }) {
  const p = getProject(slug);
  const leaf = p.accent === "leaf";
  const next = projects.find((x) => x.slug !== slug)!;
  const accentText = leaf ? "text-leaf-700" : "text-sapphire-600";
  const th = locale === "th";

  return (
    <article>
      <header className={cn(wrap, "pb-10 pt-10 sm:pt-14")}>
        <Link href={`/${locale}#work`} className="inline-flex items-center gap-1.5 text-[14px] text-mute transition hover:text-ink">
          <ArrowLeft className="size-4" /> {ui.backToWork[locale]}
        </Link>
        <div className="mt-8 flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.18em] text-mute">
          <span className={accentText}>Case study · {p.index}</span>
          <span className="h-px w-8 bg-line" />
          {leaf ? "Flutter Web" : "Flutter · Android POS"}
        </div>
        <h1 className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[56px]">{p.name}</h1>
        <p className="mt-4 max-w-3xl text-pretty text-[19px] leading-[1.7] text-ink-2">{p.tagline[locale]}</p>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [ui.role[locale], p.role[locale]],
            [ui.period[locale], p.period[locale]],
            [ui.platform[locale], p.platform[locale]],
            [ui.stack[locale], p.stack.slice(0, 4).join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-5">
              <dt className="text-[12.5px] text-mute">{k}</dt>
              <dd className="mt-2 text-[14.5px] leading-snug text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* เดโม่ */}
      <section id="demo" className="scroll-mt-20 border-y border-line bg-[#EDECE6] py-12 sm:py-16">
        <div className={wrap}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.16em] text-mute">
                <span className="rounded-full bg-ink px-2 py-0.5 text-white">{ui.demoBadge[locale]}</span> {p.name}
              </div>
              <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">{th ? "ลองใช้งานได้ทุกปุ่ม" : "Every button works — try it"}</h2>
            </div>
            <Link href={`/${locale}/demo/${leaf ? "web-admin" : "handheld"}`} className="flex h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-[14px] font-medium text-ink transition hover:border-ink/40">
              <Maximize2 className="size-4" /> {ui.fullscreen[locale]}
            </Link>
          </div>
          {demo}
          <ol className={cn("mt-8 grid gap-3", leaf ? "md:grid-cols-5" : "md:grid-cols-5")}>
            {p.tour.map((step, i) => (
              <li key={step.en} className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-[14px] leading-relaxed text-ink-2">
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold text-white", leaf ? "bg-leaf-600" : "bg-sapphire-600")}>{i + 1}</span>
                {step[locale]}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-[13.5px] text-mute">
            <MousePointerClick className="size-4" />
            {th ? "เดโม่ทั้งสองตัวใช้ข้อมูลชุดเดียวกัน — ลองทำรายการที่นี่แล้วเปิดอีกตัวดู" : "Both demos share one dataset — act here, then open the other one."}
            <Link href={`/${locale}/demo`} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              {ui.liveDemo[locale]}
            </Link>
          </p>
        </div>
      </section>

      {/* ภาพรวม */}
      <section className={cn(wrap, "grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
        <div>
          <Kicker>Overview</Kicker>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-ink">{th ? "ภาพรวมและที่มา" : "Context"}</h2>
          <div className="mt-4 space-y-5 text-pretty text-[17px] leading-[1.85] text-ink-2">
            {p.overview.map((x) => (
              <p key={x.en}>{x[locale]}</p>
            ))}
          </div>
        </div>
        <div>
          <Kicker>My part</Kicker>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-ink">{th ? "สิ่งที่ผมรับผิดชอบ" : "What I worked on"}</h2>
          <ul className="mt-4 space-y-3">
            {p.contributions.map((c) => (
              <li key={c.en} className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-[15px] leading-[1.7] text-ink-2">
                <CheckCircle2 className={cn("mt-0.5 size-5 shrink-0", accentText)} />
                {c[locale]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ฟีเจอร์ */}
      <section className="border-t border-line bg-white/50 py-16 sm:py-24">
        <div className={wrap}>
          <Kicker>Key features</Kicker>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">{th ? "ฟีเจอร์หลัก" : "What it does"}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.features.map((f) => {
              const Icon = featureIcons[f.icon];
              return (
                <div key={f.title.en} className="rounded-2xl border border-line bg-white p-6">
                  <span className={cn("grid size-10 place-items-center rounded-xl", leaf ? "bg-leaf-100 text-leaf-800" : "bg-sapphire-50 text-sapphire-700")}>{Icon && <Icon className="size-5" />}</span>
                  <h3 className="mt-4 text-[16.5px] font-semibold text-ink">{f.title[locale]}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{f.text[locale]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* สถาปัตยกรรม */}
      <section className={cn(wrap, "py-16 sm:py-24")}>
        <Kicker>Architecture</Kicker>
        <h2 className="mt-3 max-w-3xl text-[26px] font-semibold leading-snug tracking-tight text-ink sm:text-[30px]">
          {leaf ? (th ? "แยกหน้าที่ให้ชัด แม้อยู่บนโค้ดเบสเดิม" : "Clear responsibilities, even inside a legacy codebase") : th ? "ข้อมูลไหลทางเดียว : view → provider → repository → API" : "One-way data flow: view → provider → repository → API"}
        </h2>
        <div className="mt-8">{architecture}</div>
      </section>

      {/* ความท้าทาย */}
      <section className="border-t border-line bg-white/50 py-16 sm:py-24">
        <div className={wrap}>
          <Kicker>Engineering notes</Kicker>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">{th ? "โจทย์ทางเทคนิคและวิธีแก้" : "Problems worth solving"}</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {p.highlights.map((h, i) => (
              <div key={h.title.en} className="flex flex-col rounded-[22px] border border-line bg-white p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-mute">0{i + 1}</span>
                  <h3 className="text-[18px] font-semibold text-ink">{h.title[locale]}</h3>
                </div>
                <dl className="mt-4 space-y-3 text-[14.5px] leading-[1.75]">
                  <div>
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-red-700">Problem</dt>
                    <dd className="mt-1 text-ink-2">{h.problem[locale]}</dd>
                  </div>
                  <div>
                    <dt className={cn("font-mono text-[10.5px] uppercase tracking-[0.16em]", accentText)}>Approach</dt>
                    <dd className="mt-1 text-ink-2">{h.solution[locale]}</dd>
                  </div>
                  {h.result && (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2">
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-emerald-800">Result</dt>
                      <dd className="mt-0.5 text-emerald-900">{h.result[locale]}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {extra}

      {/* stack + ถัดไป */}
      <section className={cn(wrap, "grid gap-6 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]")}>
        <div className="rounded-[22px] border border-line bg-white p-7">
          <Kicker>Stack</Kicker>
          <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">{th ? "เทคโนโลยีที่ใช้" : "Built with"}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="rounded-lg bg-paper px-3 py-1.5 font-mono text-[12.5px] text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <Link href={`/${locale}/projects/${next.slug}`} className="group flex flex-col justify-between rounded-[22px] bg-ink p-7 text-white transition hover:bg-ink-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Next project</span>
          <span className="mt-6 flex items-end justify-between gap-4">
            <span>
              <span className="block text-[24px] font-semibold leading-tight">{next.name}</span>
              <span className="mt-1 block text-[14.5px] text-white/70">{next.tagline[locale]}</span>
            </span>
            <ArrowRight className="size-6 shrink-0 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </article>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-mute">{children}</div>;
}
