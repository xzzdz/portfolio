import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HandheldStage } from "@/components/demo/Stages";
import { LangSwitch } from "@/components/site/LangSwitch";
import { getProject } from "@/content/projects";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/demo/handheld">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "th";
  return { title: "Chaoperty Handheld · Demo", description: getProject("chaoperty-handheld").tagline[l] };
}

export default async function HandheldDemoPage({ params }: PageProps<"/[lang]/demo/handheld">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const p = getProject("chaoperty-handheld");
  return (
    <div className="min-h-dvh bg-[#EDECE6]">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4">
        <Link href={`/${lang}/projects/chaoperty-handheld`} className="flex items-center gap-1.5 text-[14px] text-mute hover:text-ink">
          <ArrowLeft className="size-4" /> {p.name}
        </Link>
        <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white">Demo</span>
        <LangSwitch locale={lang} className="ml-auto" />
      </div>
      <main className="pb-8">
        <HandheldStage locale={lang} />
      </main>
    </div>
  );
}
