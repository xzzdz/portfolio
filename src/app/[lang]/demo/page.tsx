import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoResetButton } from "@/components/demo/DemoEmbeds";
import { Playground } from "@/components/demo/Playground";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { playground } from "@/content/site";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/demo">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "th";
  return { title: "Live demo", description: playground.text[l] };
}

export default async function DemoPage({ params }: PageProps<"/[lang]/demo">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const th = lang === "th";
  return (
    <>
      <SiteHeader locale={lang} wide />
      <main className="mx-auto max-w-[1720px] px-4 pb-16 pt-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.18em] text-mute">
              <span className="rounded-full bg-ink px-2 py-0.5 text-white">Demo</span> Live playground
            </div>
            <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[38px]">{playground.title[lang]}</h1>
            <p className="mt-3 text-[16px] leading-[1.8] text-ink-2">{playground.text[lang]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${lang}/projects/chaoperty-handheld`} className="flex h-10 items-center rounded-full border border-ink/15 bg-white px-4 text-[14px] font-medium text-ink transition hover:border-ink/40">
              {th ? "เคสสตัดี้ Handheld" : "Handheld case study"}
            </Link>
            <Link href={`/${lang}/projects/chaoperty-web-admin`} className="flex h-10 items-center rounded-full border border-ink/15 bg-white px-4 text-[14px] font-medium text-ink transition hover:border-ink/40">
              {th ? "เคสสตัดี้ Web Admin" : "Web admin case study"}
            </Link>
            <DemoResetButton label={playground.reset[lang]} doneLabel={playground.resetDone[lang]} />
          </div>
        </div>

        <ol className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {playground.steps.map((step, i) => (
            <li key={step.en} className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-[14px] leading-relaxed text-ink-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sapphire-600 font-mono text-[12px] font-semibold text-white">{i + 1}</span>
              {step[lang]}
            </li>
          ))}
        </ol>

        <Playground locale={lang} />
      </main>
      <SiteFooter locale={lang} />
    </>
  );
}
