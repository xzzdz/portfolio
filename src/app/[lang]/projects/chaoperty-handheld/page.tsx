import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HandheldArchitecture } from "@/components/site/Architecture";
import { CaseStudy, Kicker } from "@/components/site/CaseStudy";
import { HandheldDemoBlock } from "@/components/site/DemoBlocks";
import { PromptPayLab } from "@/components/site/PromptPayLab";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { getProject } from "@/content/projects";
import { hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/chaoperty-handheld">): Promise<Metadata> {
  const { lang } = await params;
  const p = getProject("chaoperty-handheld");
  const l = hasLocale(lang) ? lang : "th";
  return { title: p.name, description: p.tagline[l] };
}

export default async function HandheldCaseStudy({ params }: PageProps<"/[lang]/projects/chaoperty-handheld">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const th = lang === "th";
  return (
    <>
      <SiteHeader locale={lang} />
      <main>
        <CaseStudy
          slug="chaoperty-handheld"
          locale={lang}
          demo={<HandheldDemoBlock locale={lang} />}
          architecture={<HandheldArchitecture locale={lang} />}
          extra={
            <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
              <Kicker>Under the hood</Kicker>
              <h2 className="mt-3 max-w-3xl text-[26px] font-semibold leading-snug tracking-tight text-ink sm:text-[30px]">
                {th ? "QR พร้อมเพย์หนึ่งใบประกอบจากอะไรบ้าง" : "What a PromptPay QR is actually made of"}
              </h2>
              <p className="mt-3 max-w-3xl text-[16px] leading-[1.8] text-ink-2">
                {th
                  ? "แอปประกอบ payload ตามมาตรฐาน EMVCo เองในเครื่อง : แต่ละช่องเป็น ID + ความยาว + ค่า แล้วปิดท้ายด้วย CRC-16 — ลองเปลี่ยนยอดเงินแล้วดูว่าช่องไหนเปลี่ยนตาม"
                  : "The app assembles the EMVCo payload on-device: each field is ID + length + value, sealed with a CRC-16. Change the amount and watch which fields move."}
              </p>
              <div className="mt-8">
                <PromptPayLab locale={lang} />
              </div>
            </section>
          }
        />
      </main>
      <SiteFooter locale={lang} />
    </>
  );
}
