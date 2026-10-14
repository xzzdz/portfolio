import { ArrowRight, ArrowUpRight, BookOpenText, Briefcase, FileDown, GraduationCap, Mail, MapPin, Monitor, MonitorSmartphone, Phone, Smartphone, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { projects, type Project } from "@/content/projects";
import { about, contact, education, experience, facts, hero, playground, skills, ui } from "@/content/site";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { GithubIcon } from "./BrandIcons";
import { CopyButton } from "./CopyButton";
import { HeroVisual } from "./HeroVisual";
import { SectionHead } from "./SiteChrome";

const wrap = "mx-auto max-w-[1200px] px-4 sm:px-6";

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <div className={cn(wrap, "relative grid gap-6 pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10 lg:pt-14")}>
        <div className="animate-rise self-center lg:pb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1 pl-1.5 pr-3 text-[12.5px] text-ink-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              {profile.availability[locale]}
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-mute sm:inline">{hero.kicker[locale]}</span>
          </div>
          <h1 className="text-balance text-[34px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[50px] lg:text-[56px]">{hero.title[locale]}</h1>
          <p className="mt-6 max-w-2xl text-pretty text-[17.5px] leading-[1.8] text-ink-2">{hero.intro[locale]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}#work`} className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition hover:bg-ink-2">
              {ui.seeWork[locale]} <ArrowRight className="size-4" />
            </Link>
            <Link href={`/${locale}/demo`} className="flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-white px-6 text-[15px] font-medium text-ink transition hover:border-ink/40">
              <MonitorSmartphone className="size-4 text-sapphire-600" /> {ui.liveDemo[locale]}
            </Link>
            <a href={`/resume-${locale}.pdf`} download className="flex h-12 items-center gap-2 px-2 text-[15px] font-medium text-ink-2 underline decoration-line underline-offset-4 transition hover:text-ink hover:decoration-ink">
              <FileDown className="size-4" /> {ui.download[locale]}
            </a>
          </div>
        </div>
        <div className="relative h-[500px] overflow-hidden sm:h-[560px] lg:h-[620px]">
          <HeroVisual locale={locale} />
        </div>
      </div>
      <div className="relative z-10 border-y border-line bg-[#FAF9F6]">
        <dl className={cn(wrap, "grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x")}>
          {facts.map((f) => (
            <div key={f.value.en} className="px-1 py-6 lg:px-6 lg:first:pl-0">
              <dt className="text-[26px] font-semibold tracking-tight text-ink">{f.value[locale]}</dt>
              <dd className="mt-1 text-[13.5px] leading-snug text-mute">{f.label[locale]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ProjectCard({ project, locale, flip }: { project: Project; locale: Locale; flip?: boolean }) {
  const leaf = project.accent === "leaf";
  return (
    <article className="group grid overflow-hidden rounded-[28px] border border-line bg-white lg:grid-cols-2">
      <div className={cn("flex flex-col p-7 sm:p-10", flip && "lg:order-2")}>
        <div className="flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-mute">
          <span className={leaf ? "text-leaf-700" : "text-sapphire-600"}>{project.index}</span>
          <span className="h-px w-6 bg-line" />
          {leaf ? "Web · Flutter Web" : "Mobile · Android POS"}
        </div>
        <h3 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px]">{project.name}</h3>
        <p className="mt-2 text-[17px] font-medium text-ink-2">{project.tagline[locale]}</p>
        <p className="mt-4 text-pretty text-[15.5px] leading-[1.8] text-mute">{project.summary[locale]}</p>
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 7).map((s) => (
            <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11.5px] text-ink-2">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-3 pt-8">
          <Link href={`/${locale}/projects/${project.slug}`} className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-medium text-white transition hover:bg-ink-2">
            {ui.caseStudy[locale]} <ArrowRight className="size-4" />
          </Link>
          <Link
            href={`/${locale}/projects/${project.slug}#demo`}
            className={cn("flex h-11 items-center gap-2 rounded-full border px-5 text-[14.5px] font-medium transition", leaf ? "border-leaf-300 text-leaf-800 hover:bg-leaf-50" : "border-sapphire-200 text-sapphire-700 hover:bg-sapphire-50")}
          >
            {leaf ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
            {ui.openDemo[locale]}
          </Link>
        </div>
      </div>
      <Link
        href={`/${locale}/projects/${project.slug}`}
        className={cn("relative flex min-h-[320px] items-center justify-center overflow-hidden p-6 sm:p-10", leaf ? "bg-[linear-gradient(150deg,#E6F2D6,#CFE6B0_60%,#B1D584)]" : "bg-[linear-gradient(150deg,#D9E6FA,#86ABEB_65%,#2563D0)]", flip && "lg:order-1")}
        aria-label={project.name}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <span className="absolute right-4 top-4 rounded-full bg-white/80 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-2">{ui.demoBadge[locale]}</span>
        <Image src={locale === "en" ? project.cover.src.replace(".webp", "-en.webp") : project.cover.src} alt={project.cover.alt[locale]} width={project.cover.w} height={project.cover.h} className="relative h-auto w-full max-w-[560px] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.015]" sizes="(min-width: 1024px) 560px, 100vw" />
      </Link>
    </article>
  );
}

export function Work({ locale }: { locale: Locale }) {
  return (
    <section id="work" className="scroll-mt-20 py-20 sm:py-28">
      <div className={wrap}>
        <SectionHead
          index="01"
          kicker="Selected work"
          title={locale === "th" ? "สองระบบที่ทำงานคู่กันทุกวันในตลาดจริง" : "Two systems that work side by side in real markets every day"}
          lead={locale === "th" ? "ทั้งสองโปรเจคเป็นส่วนหนึ่งของ Chaoperty และใช้ backend ตัวเดียวกัน — ลองกดใช้เดโม่ด้านล่างได้ทุกปุ่ม" : "Both are part of Chaoperty and share one backend — every button in the demos below works."}
        />
        <div className="space-y-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} locale={locale} flip={i % 2 === 1} />
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[28px] bg-ink p-8 text-white sm:p-10">
          <div className="dot-grid absolute inset-0 opacity-[0.15] invert" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.16em] text-sapphire-300">
                <Sparkles className="size-4" /> Live playground
              </div>
              <h3 className="mt-3 text-[26px] font-semibold leading-snug tracking-tight sm:text-[30px]">{playground.title[locale]}</h3>
              <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.8] text-white/70">{playground.text[locale]}</p>
            </div>
            <Link href={`/${locale}/demo`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-ink transition hover:bg-sapphire-50">
              <MonitorSmartphone className="size-5 text-sapphire-600" /> {ui.liveDemo[locale]}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About({ locale }: { locale: Locale }) {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line bg-white/50 py-20 sm:py-28">
      <div className={cn(wrap, "grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
        <div>
          <SectionHead index="02" kicker="About" title={about.title[locale]} className="mb-6" />
          <div className="space-y-5 text-pretty text-[17px] leading-[1.85] text-ink-2">
            {about.body.map((p) => (
              <p key={p.en}>{p[locale]}</p>
            ))}
          </div>
        </div>
        <div className="space-y-3 lg:pt-28">
          {about.points.map((pt, i) => (
            <div key={pt.title.en} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper font-mono text-[13px] font-semibold text-sapphire-600">0{i + 1}</span>
              <div>
                <div className="text-[16px] font-semibold text-ink">{pt.title[locale]}</div>
                <div className="mt-1 text-[14.5px] leading-relaxed text-mute">{pt.text[locale]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Skills({ locale }: { locale: Locale }) {
  return (
    <section id="skills" className="scroll-mt-20 py-20 sm:py-28">
      <div className={wrap}>
        <SectionHead
          index="03"
          kicker="Skills"
          title={locale === "th" ? "เครื่องมือที่ใช้ทำงานจริง และสิ่งที่กำลังเรียนต่อ" : "What I ship with — and what I'm learning next"}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((g) => (
            <div key={g.title.en} className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-[16px] font-semibold text-ink">{g.title[locale]}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-[13.5px]",
                      it.learning ? "border border-dashed border-sapphire-300 bg-sapphire-50 text-sapphire-800" : "bg-paper text-ink-2",
                    )}
                  >
                    {it.name}
                    {it.learning && <span className={cn("ml-1.5 text-sapphire-600", locale === "th" ? "text-[11px]" : "font-mono text-[10px] uppercase tracking-wider")}>{ui.learning[locale]}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-line p-6">
            <BookOpenText className="size-6 text-sapphire-600" />
            <p className="mt-6 text-[14.5px] leading-relaxed text-mute">
              {locale === "th"
                ? "ป้ายเส้นประ = กำลังศึกษา — เว็บนี้ทั้งหน้า รวมถึงเดโม่ทั้งสองตัว เขียนด้วย TypeScript + Next.js เพื่อฝึกใช้จริง"
                : "Dashed = currently learning. This whole site, demos included, is written in TypeScript + Next.js as practice on a real project."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Experience({ locale }: { locale: Locale }) {
  return (
    <section id="experience" className="scroll-mt-20 border-t border-line bg-white/50 py-20 sm:py-28">
      <div className={wrap}>
        <SectionHead index="04" kicker="Experience" title={experience.title[locale]} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-[24px] border border-line bg-white p-7 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-white">
                  <Briefcase className="size-5" />
                </span>
                <div>
                  <h3 className="text-[20px] font-semibold text-ink">{experience.company[locale]}</h3>
                  <div className="text-[15px] text-ink-2">{experience.position[locale]}</div>
                </div>
              </div>
              <div className="text-right text-[13px] tabular-nums text-mute">
                <div className="text-ink">{experience.period[locale]}</div>
                <div>{experience.place[locale]}</div>
              </div>
            </div>
            <p className="mt-6 text-[16px] leading-[1.8] text-ink-2">{experience.summary[locale]}</p>
            <ul className="mt-5 space-y-3">
              {experience.bullets.map((b) => (
                <li key={b.en} className="flex gap-3 text-[15px] leading-[1.75] text-ink-2">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-sapphire-600" />
                  {b[locale]}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-6">
              {experience.tags.map((s) => (
                <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11.5px] text-ink-2">
                  {s}
                </li>
              ))}
            </ul>
          </article>
          <div className="space-y-6">
            <article className="rounded-[24px] border border-line bg-white p-7">
              <div className="flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-mute">
                <GraduationCap className="size-4 text-sapphire-600" /> Education
              </div>
              <h3 className="mt-4 text-[18px] font-semibold text-ink">{education.school[locale]}</h3>
              <p className="mt-1 text-[15px] text-ink-2">{education.degree[locale]}</p>
              <p className="mt-3 text-[13px] tabular-nums text-mute">{education.period[locale]}</p>
            </article>
            <article className="rounded-[24px] border border-sapphire-200 bg-sapphire-50/60 p-7">
              <div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-sapphire-700">Lessons learned</div>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-2">
                {locale === "th"
                  ? "ซอฟต์แวร์ที่ดีต้องไปได้ดีบนเครื่องจริงของผู้ใช้ — ทั้งเครื่อง POS สเปกต่ำ กระดาษความร้อน และข้อมูลจริงที่ไม่เคยสะอาดเท่าตัวอย่าง"
                  : "Good software has to hold up on the user's actual hardware — a low-spec POS, thermal paper, and real data that is never as clean as the sample."}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact({ locale }: { locale: Locale }) {
  return (
    <section id="contact" className="scroll-mt-20 py-20 sm:py-28">
      <div className={wrap}>
        <div className="relative overflow-hidden rounded-[32px] border border-line bg-white p-8 sm:p-14">
          <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_90%_10%,black,transparent_60%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <div className="flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.18em] text-mute">
                <span className="text-sapphire-600">05</span>
                <span className="h-px w-8 bg-line" />
                Contact
              </div>
              <h2 className="mt-4 text-balance text-[34px] font-semibold leading-tight tracking-tight text-ink sm:text-[44px]">{contact.title[locale]}</h2>
              <p className="mt-4 max-w-xl text-[17px] leading-[1.8] text-ink-2">{contact.text[locale]}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`mailto:${profile.email}`} className="flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition hover:bg-ink-2">
                  <Mail className="size-4" /> {profile.email}
                </a>
                <CopyButton value={profile.email} labels={{ copy: ui.copy[locale], copied: ui.copied[locale] }} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14.5px]">
                <a href={`/resume-${locale}.pdf`} download className="flex items-center gap-2 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                  <FileDown className="size-4" /> {ui.download[locale]} (PDF)
                </a>
                <Link href={`/${locale}/resume`} className="text-mute underline decoration-line underline-offset-4 hover:text-ink">
                  {locale === "th" ? "ดูแบบออนไลน์" : "View online"}
                </Link>
              </div>
            </div>
            <ul className="grid content-start gap-3">
              {[
                { icon: Phone, label: contact.phone[locale], value: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` },
                { icon: GithubIcon, label: "GitHub", value: profile.github.replace("https://", ""), href: profile.github },
                { icon: MapPin, label: contact.location[locale], value: profile.location[locale] },
              ].map((c) => (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-line bg-paper/60 px-5 py-4 transition hover:border-ink/30 hover:bg-white">
                      <c.icon className="size-5 shrink-0 text-ink-2" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] text-mute">{c.label}</span>
                        <span className="block truncate text-[15px] text-ink">{c.value}</span>
                      </span>
                      <ArrowUpRight className="size-4 text-mute transition group-hover:text-ink" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper/60 px-5 py-4">
                      <c.icon className="size-5 shrink-0 text-ink-2" />
                      <span>
                        <span className="block text-[12.5px] text-mute">{c.label}</span>
                        <span className="block text-[15px] text-ink">{c.value}</span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
