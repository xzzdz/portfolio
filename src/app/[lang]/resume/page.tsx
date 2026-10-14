import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Download, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GithubIcon, LinkedinIcon } from "@/components/site/BrandIcons";
import { PrintButton } from "@/components/site/PrintButton";
import { QrCode } from "@/components/site/QrCode";
import { LangSwitch } from "@/components/site/LangSwitch";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { education, experience } from "@/content/site";
import { hasLocale } from "@/lib/i18n";
import { publicSiteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/resume">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "th";
  return { title: l === "th" ? "Resume" : "Résumé", description: profile.tagline[l] };
}

/** Resume ขนาด A4 หนึ่งหน้า — สั่งพิมพ์หรือแปลงเป็น PDF ได้ตรงขนาด (npm run resume) */
export default async function ResumePage({ params }: PageProps<"/[lang]/resume">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const th = lang === "th";
  const h = resume.headings;
  // ยังไม่ตั้งโดเมน → ไม่พิมพ์ QR/ลิงก์ผลงาน (ลิงก์ localhost บนกระดาษไม่มีประโยชน์)
  const site = publicSiteUrl.replace(/^https?:\/\//, "");
  const github = profile.github.replace("https://", "");

  return (
    <div className="min-h-dvh bg-[#E9E8E3] py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center gap-3 px-4">
        <Link href={`/${lang}`} className="flex items-center gap-1.5 text-[14px] text-mute hover:text-ink">
          <ArrowLeft className="size-4" /> {th ? "กลับหน้าแรก" : "Back to site"}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LangSwitch locale={lang} />
          <PrintButton label={th ? "พิมพ์" : "Print"} />
          <a href={`/resume-${lang}.pdf`} download className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-medium text-white hover:bg-ink-2">
            <Download className="size-4" /> PDF
          </a>
        </div>
      </div>

      <article className="mx-auto box-border flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white px-[15mm] py-[11mm] text-[9.6pt] leading-[1.5] text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] print:shadow-none">
        {/* หัว */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-[4mm]">
          <div>
            <h1 className="text-[25pt] font-semibold leading-none tracking-tight">{profile.name[lang]}</h1>
            <div className="mt-[2mm] text-[12.5pt] font-medium text-sapphire-600">{profile.role[lang]}</div>
            <ul className="mt-[3mm] flex flex-wrap gap-x-[5mm] gap-y-[1mm] text-[9pt] text-ink-2">
              <li className="flex items-center gap-1.5">
                <Mail className="size-[3.2mm]" /> {profile.email}
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="size-[3.2mm]" /> {profile.phone}
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-[3.2mm]" /> {profile.location[lang]}
              </li>
              <li className="flex items-center gap-1.5">
                <GithubIcon className="size-[3.2mm]" /> {github}
              </li>
              {profile.linkedin && (
                <li className="flex items-center gap-1.5">
                  <LinkedinIcon className="size-[3.2mm]" /> {profile.linkedin.replace(/^https:\/\/(www\.)?/, "")}
                </li>
              )}
            </ul>
          </div>
          {site && (
            <div className="flex shrink-0 flex-col items-center gap-1 text-center">
              <QrCode value={`${publicSiteUrl}/${lang}`} size={64} />
              <span className="text-[7pt] leading-tight text-mute">{h.portfolio[lang]}</span>
            </div>
          )}
        </header>

        <Section title={h.summary[lang]} latin={!th}>
          <p className="text-pretty text-ink-2">{resume.summary[lang]}</p>
        </Section>

        <Section title={h.experience[lang]} latin={!th}>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="text-[11pt] font-semibold">{experience.company[lang]}</span>
              <span className="text-ink-2"> · {experience.position[lang]}</span>
            </div>
            <span className="shrink-0 text-[9pt] tabular-nums text-mute">
              {experience.period[lang]} · {experience.place[lang]}
            </span>
          </div>
          <ul className="mt-[1.5mm] space-y-[0.8mm]">
            {resume.experienceBullets.map((b) => (
              <li key={b.en} className="flex gap-2 text-ink-2">
                <span className="mt-[2.1mm] size-[1.3mm] shrink-0 rounded-full bg-sapphire-600" />
                {b[lang]}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={h.projects[lang]} latin={!th}>
          <div className="space-y-[2mm]">
            {resume.projects.map((p) => (
              <div key={p.name}>
                <div className="flex items-baseline justify-between gap-4">
                  {/* มีโดเมนแล้ว ชื่อโปรเจคเป็นลิงก์ไปเคสสตัดี้ (กดได้ใน PDF) — ไม่เพิ่มบรรทัด URL ให้ล้นหน้า */}
                  {site ? (
                    <a href={`${publicSiteUrl}/${lang}/projects/${p.slug}`} className="flex shrink-0 items-center gap-1 text-[10.5pt] font-semibold">
                      {p.name}
                      <ArrowUpRight className="size-[3.2mm] text-sapphire-600" />
                    </a>
                  ) : (
                    <span className="text-[10.5pt] font-semibold">{p.name}</span>
                  )}
                  <span className="truncate text-[8.5pt] text-mute">{p.stack}</span>
                </div>
                <p className="text-ink-2">{p.text[lang]}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title={h.skills[lang]} latin={!th}>
          <dl className="grid grid-cols-[30mm_1fr] gap-x-[4mm] gap-y-[0.8mm]">
            {resume.skills.map((s) => (
              <div key={s.k.en} className="contents">
                <dt className="font-semibold">{s.k[lang]}</dt>
                <dd className="text-ink-2">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title={h.education[lang]} latin={!th}>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <span className="text-[10.5pt] font-semibold">{education.school[lang]}</span>
              <span className="text-ink-2"> · {education.degree[lang]}</span>
            </div>
            <span className="shrink-0 text-[9pt] tabular-nums text-mute">{education.period[lang]}</span>
          </div>
        </Section>

        <footer className="mt-auto flex items-center justify-between border-t border-line pt-[3mm] text-[8pt] text-mute">
          <span>{profile.name[lang]} · {profile.role[lang]}</span>
          <span>{site || github}</span>
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children, latin }: { title: string; children: React.ReactNode; latin?: boolean }) {
  return (
    <section className="mt-[4.2mm]">
      {/* ตัวไทยไม่ควรถ่างระยะตัวอักษร — ใช้ tracking เฉพาะหัวข้อภาษาอังกฤษ */}
      <h2 className={`mb-[2mm] flex items-center gap-3 text-[10.5pt] font-semibold text-sapphire-700 ${latin ? "uppercase tracking-[0.12em]" : ""}`}>
        {title}
        <span className="h-px flex-1 bg-line" />
      </h2>
      {children}
    </section>
  );
}
