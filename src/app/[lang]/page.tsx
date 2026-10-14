import { notFound } from "next/navigation";
import { About, Contact, Experience, Hero, Skills, Work } from "@/components/site/sections";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { hasLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <>
      <SiteHeader locale={lang} />
      <main>
        <Hero locale={lang} />
        <Work locale={lang} />
        <About locale={lang} />
        <Skills locale={lang} />
        <Experience locale={lang} />
        <Contact locale={lang} />
      </main>
      <SiteFooter locale={lang} />
    </>
  );
}
