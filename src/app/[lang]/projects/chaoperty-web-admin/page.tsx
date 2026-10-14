import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebAdminArchitecture } from "@/components/site/Architecture";
import { CaseStudy } from "@/components/site/CaseStudy";
import { WebAdminDemoBlock } from "@/components/site/DemoBlocks";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { getProject } from "@/content/projects";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/chaoperty-web-admin">): Promise<Metadata> {
  const { lang } = await params;
  const p = getProject("chaoperty-web-admin");
  const l = hasLocale(lang) ? lang : "th";
  return { title: p.name, description: p.tagline[l] };
}

export default async function WebAdminCaseStudy({ params }: PageProps<"/[lang]/projects/chaoperty-web-admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <>
      <SiteHeader locale={lang} />
      <main>
        <CaseStudy slug="chaoperty-web-admin" locale={lang} demo={<WebAdminDemoBlock locale={lang} />} architecture={<WebAdminArchitecture locale={lang} />} />
      </main>
      <SiteFooter locale={lang} />
    </>
  );
}
