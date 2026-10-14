import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WebAdminEmbed } from "@/components/demo/DemoEmbeds";
import { LangSwitch } from "@/components/site/LangSwitch";
import { getProject } from "@/content/projects";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/demo/web-admin">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "th";
  return { title: "Chaoperty Web Admin · Demo", description: getProject("chaoperty-web-admin").tagline[l] };
}

export default async function WebAdminDemoPage({ params }: PageProps<"/[lang]/demo/web-admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const p = getProject("chaoperty-web-admin");
  return (
    <div className="min-h-dvh bg-[#EDECE6]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
        <Link href={`/${lang}/projects/chaoperty-web-admin`} className="flex items-center gap-1.5 text-[14px] text-mute hover:text-ink">
          <ArrowLeft className="size-4" /> {p.name}
        </Link>
        <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white">Demo</span>
        <LangSwitch locale={lang} className="ml-auto" />
      </div>
      <main className="mx-auto max-w-[1400px] px-4 pb-10">
        <div className="aspect-[1280/860] w-full">
          <WebAdminEmbed locale={lang} height={860} />
        </div>
      </main>
    </div>
  );
}
